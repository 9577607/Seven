from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="AutoContent AI Service")


class CopyRequest(BaseModel):
    topic: str
    style: str | None = None
    platform: str | None = None
    length: str | None = None
    language: str | None = "zh"


class ImageRequest(BaseModel):
    prompt: str
    style: str | None = None
    ratio: str = "1:1"
    resolution: str | None = "1024x1024"


class VideoRequest(BaseModel):
    prompt: str
    duration: str = "10"
    ratio: str = "9:16"
    fps: int = 30
    style: str | None = None
    camera_motion: str | None = None


@app.get("/health")
def health():
    return {"ok": True, "service": "ai_service"}


@app.post("/api/ai/generate-copy")
def generate_copy(payload: CopyRequest):
    return {
        "title": f"{payload.topic}｜高转化短视频标题",
        "script": f"围绕{payload.topic}的短视频脚本（{payload.style or '通用风格'}）",
        "hashtags": ["#AI创作", "#AutoContent", f"#{payload.topic}"],
        "description": f"这是关于{payload.topic}的自动生成内容描述。",
    }


@app.post("/api/ai/generate-image")
def generate_image(payload: ImageRequest):
    safe_prompt = payload.prompt.replace(" ", "_")
    return {
        "image_url": f"https://cdn.example.com/images/{safe_prompt}_{payload.ratio}.png"
    }


@app.post("/api/ai/generate-video")
def generate_video(payload: VideoRequest):
    safe_prompt = payload.prompt.replace(" ", "_")
    return {
        "video_url": f"https://cdn.example.com/videos/{safe_prompt}_{payload.ratio}_{payload.duration}s.mp4"
    }
