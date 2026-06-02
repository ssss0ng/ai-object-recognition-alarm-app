from io import BytesIO
from pathlib import Path

from fastapi import HTTPException, UploadFile
from PIL import Image, ImageEnhance, ImageOps, UnidentifiedImageError
from torchvision.models import MobileNet_V2_Weights, ResNet18_Weights

from constants import ALLOWED_IMAGE_EXTENSIONS, USE_CUSTOM_AUGMENTATION, USE_LOW_LIGHT_NORMALIZATION


TRANSFORMS = {
    "resnet": ResNet18_Weights.DEFAULT.transforms(),
    "mobilenet": MobileNet_V2_Weights.DEFAULT.transforms(),
}


async def read_image_upload(file: UploadFile) -> Image.Image:
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="Image file is required.")

    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image type. Allowed types: {sorted(ALLOWED_IMAGE_EXTENSIONS)}",
        )

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded image file is empty.")

    try:
        image = Image.open(BytesIO(content)).convert("RGB")
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(status_code=400, detail="Invalid image file.") from exc

    return normalize_low_light(image)


def normalize_low_light(image: Image.Image) -> Image.Image:
    if not USE_LOW_LIGHT_NORMALIZATION:
        return image
    return ImageOps.autocontrast(image, cutoff=1)


def build_custom_registration_variants(image: Image.Image) -> list[Image.Image]:
    if not USE_CUSTOM_AUGMENTATION:
        return [image]

    return [
        image,
        ImageEnhance.Brightness(image).enhance(1.15),
        ImageEnhance.Brightness(image).enhance(0.85),
        image.rotate(6, resample=Image.Resampling.BICUBIC, expand=False),
    ]


def preprocess_image(image: Image.Image, model_name: str):
    transform = TRANSFORMS[model_name]
    return transform(image).unsqueeze(0)
