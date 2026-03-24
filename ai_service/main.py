from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

app = FastAPI(title="AutoContent AI Service")


class CopyRequest(BaseModel):
    topic: str = Field(min_length=1)
    style: str | None = None
    platform: str | None = None
    length: str | None = None
    language: str | None = "zh"


class ImageRequest(BaseModel):
    prompt: str = Field(min_length=1)
    style: str | None = None
    ratio: str = "1:1"
    resolution: str | None = "1024x1024"


class VideoRequest(BaseModel):
    prompt: str = Field(min_length=1)
    duration: str = "10"
    ratio: str = "9:16"
    fps: int = 30
    style: str | None = None
    camera_motion: str | None = None


def ok(data, message="ok"):
    return {"code": 0, "message": message, "data": data}


@app.exception_handler(Exception)
async def global_exception_handler(_: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"code": 50000, "message": f"ai_service error: {str(exc)}", "data": None})


@app.get("/health")
def health():
    return ok({"service": "ai_service"})


@app.post("/api/ai/generate-copy")
def generate_copy(payload: CopyRequest):
    try:
        data = {
            "title": f"{payload.topic}｜高转化短视频标题",
            "script": f"围绕{payload.topic}的短视频脚本（{payload.style or '通用风格'}）",
            "hashtags": ["#AI创作", "#AutoContent", f"#{payload.topic}"],
            "description": f"这是关于{payload.topic}的自动生成内容描述。",
        }
        return ok(data)
    except Exception as exc:
        return JSONResponse(status_code=500, content={"code": 50001, "message": str(exc), "data": None})


@app.post("/api/ai/generate-image")
def generate_image(payload: ImageRequest):
    try:
        safe_prompt = payload.prompt.replace(" ", "_")
        data = {"image_url": f"https://cdn.example.com/images/{safe_prompt}_{payload.ratio}.png"}
        return ok(data)
    except Exception as exc:
        return JSONResponse(status_code=500, content={"code": 50002, "message": str(exc), "data": None})


@app.post("/api/ai/generate-video")
def generate_video(payload: VideoRequest):
    try:
        safe_prompt = payload.prompt.replace(" ", "_")
        data = {"video_url": f"https://cdn.example.com/videos/{safe_prompt}_{payload.ratio}_{payload.duration}s.mp4"}
        return ok(data)
    except Exception as exc:
        return JSONResponse(status_code=500, content={"code": 50003, "message": str(exc), "data": None})
