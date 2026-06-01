import torch
import torch.nn.functional as F

from constants import CUSTOM_SIMILARITY_THRESHOLD
from model_loader import models


def extract_embedding(image_tensor) -> torch.Tensor:
    image_tensor = image_tensor.to(models.device)

    # The classifier layer is removed, so this tensor represents visual features.
    with torch.no_grad():
        embedding = models.feature_extractor(image_tensor)
        embedding = F.normalize(embedding, p=2, dim=1)

    return embedding.squeeze(0).cpu()


def average_embeddings(embeddings: list[torch.Tensor]) -> torch.Tensor:
    stacked = torch.stack(embeddings)
    averaged = stacked.mean(dim=0)
    return F.normalize(averaged, p=2, dim=0)


def cosine_similarity(a: torch.Tensor, b: torch.Tensor) -> float:
    similarity = F.cosine_similarity(a.unsqueeze(0), b.unsqueeze(0)).item()
    return round(float(similarity), 4)


def is_custom_match(similarity: float) -> bool:
    return similarity >= CUSTOM_SIMILARITY_THRESHOLD
