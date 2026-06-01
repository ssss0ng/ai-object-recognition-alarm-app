import json
import re
from datetime import datetime, timezone

import torch
from fastapi import HTTPException

from constants import EMBEDDINGS_DIR, REGISTERED_OBJECTS_DIR


OBJECT_ID_PATTERN = re.compile(r"^[a-zA-Z0-9_-]{1,64}$")


def ensure_storage_dirs() -> None:
    REGISTERED_OBJECTS_DIR.mkdir(parents=True, exist_ok=True)
    EMBEDDINGS_DIR.mkdir(parents=True, exist_ok=True)


def validate_object_id(object_id: str) -> None:
    if not OBJECT_ID_PATTERN.fullmatch(object_id):
        raise HTTPException(
            status_code=400,
            detail="object_id must use only letters, numbers, underscores, or hyphens.",
        )


def embedding_path(object_id: str):
    validate_object_id(object_id)
    return EMBEDDINGS_DIR / f"{object_id}.pt"


def metadata_path(object_id: str):
    validate_object_id(object_id)
    return REGISTERED_OBJECTS_DIR / f"{object_id}.json"


def save_custom_object(object_id: str, embedding: torch.Tensor, num_images: int) -> None:
    ensure_storage_dirs()
    torch.save(embedding, embedding_path(object_id))

    metadata = {
        "object_id": object_id,
        "num_images": num_images,
        "embedding_file": str(embedding_path(object_id).name),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    metadata_path(object_id).write_text(
        json.dumps(metadata, indent=2),
        encoding="utf-8",
    )


def load_custom_embedding(object_id: str) -> torch.Tensor:
    path = embedding_path(object_id)
    if not path.exists():
        raise HTTPException(status_code=404, detail="Custom object is not registered.")
    return torch.load(path, map_location="cpu")


def list_custom_objects() -> list[dict]:
    ensure_storage_dirs()
    objects = []
    for path in sorted(REGISTERED_OBJECTS_DIR.glob("*.json")):
        metadata = json.loads(path.read_text(encoding="utf-8"))
        objects.append(
            {
                "object_id": metadata["object_id"],
                "num_images": metadata["num_images"],
                "embedding_file": metadata["embedding_file"],
                "metadata_file": path.name,
            }
        )
    return objects
