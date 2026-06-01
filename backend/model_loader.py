import torch
from torch import nn
from torchvision.models import (
    MobileNet_V2_Weights,
    ResNet18_Weights,
    mobilenet_v2,
    resnet18,
)


DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def _load_resnet_classifier() -> nn.Module:
    model = resnet18(weights=ResNet18_Weights.DEFAULT)
    model.eval()
    return model.to(DEVICE)


def _load_mobilenet_classifier() -> nn.Module:
    model = mobilenet_v2(weights=MobileNet_V2_Weights.DEFAULT)
    model.eval()
    return model.to(DEVICE)


def _load_feature_extractor() -> nn.Module:
    base_model = resnet18(weights=ResNet18_Weights.DEFAULT)
    modules = list(base_model.children())[:-1]
    feature_extractor = nn.Sequential(*modules, nn.Flatten())
    feature_extractor.eval()
    return feature_extractor.to(DEVICE)


class ModelBundle:
    def __init__(self) -> None:
        self.device = DEVICE
        self.classifiers = {
            "resnet": _load_resnet_classifier(),
            "mobilenet": _load_mobilenet_classifier(),
        }
        self.categories = {
            "resnet": ResNet18_Weights.DEFAULT.meta["categories"],
            "mobilenet": MobileNet_V2_Weights.DEFAULT.meta["categories"],
        }
        self.feature_extractor = _load_feature_extractor()


models = ModelBundle()
