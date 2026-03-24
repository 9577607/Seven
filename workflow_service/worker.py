import json
import os
import time
import requests
import pika
import psycopg2
from psycopg2.extras import Json

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
WORKFLOW_QUEUE = os.getenv("WORKFLOW_QUEUE", "autocontent_tasks")
DATABASE_URL = os.getenv("DATABASE_URL")
AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://ai_service:8000")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required")


def db_conn():
    return psycopg2.connect(DATABASE_URL)


def update_task(task_id: int, status: str, result: dict | None = None):
    conn = db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE tasks SET status = %s, result = %s WHERE id = %s",
                (status, Json(result or {}), task_id),
            )
        conn.commit()
    finally:
        conn.close()


def call_ai(task_type: str, payload: dict):
    mapping = {
        "generate_copy": "/api/ai/generate-copy",
        "generate_image": "/api/ai/generate-image",
        "generate_video": "/api/ai/generate-video",
    }
    if task_type not in mapping:
        raise ValueError(f"unsupported task type: {task_type}")

    resp = requests.post(f"{AI_SERVICE_URL}{mapping[task_type]}", json=payload, timeout=20)
    resp.raise_for_status()
    body = resp.json()
    return body.get("data", body)


def on_message(ch, method, _, body):
    try:
        data = json.loads(body.decode("utf-8"))
        task_id = data["task_id"]
        task_type = data["type"]
        payload = data.get("payload", {})

        update_task(task_id, "running", {"started_at": int(time.time())})
        ai_result = call_ai(task_type, payload)
        update_task(task_id, "completed", {"task_type": task_type, "output": ai_result})
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as exc:
        task_id = None
        try:
            task_id = json.loads(body.decode("utf-8")).get("task_id")
        except Exception:
            pass
        if task_id:
            update_task(task_id, "failed", {"error": str(exc)})
        ch.basic_ack(delivery_tag=method.delivery_tag)


def main():
    params = pika.URLParameters(RABBITMQ_URL)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.queue_declare(queue=WORKFLOW_QUEUE, durable=True)
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=WORKFLOW_QUEUE, on_message_callback=on_message)
    print(f"[workflow] waiting queue={WORKFLOW_QUEUE}")
    channel.start_consuming()


if __name__ == "__main__":
    while True:
        try:
            main()
        except Exception as e:
            print(f"[workflow] reconnect after error: {e}")
            time.sleep(5)
