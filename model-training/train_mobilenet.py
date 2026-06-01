from pathlib import Path

import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets
from torchvision.models import MobileNet_V2_Weights, mobilenet_v2

from augmentation import build_eval_transform, build_train_transform


DATA_DIR = Path("data")
BATCH_SIZE = 16
NUM_EPOCHS = 5
LEARNING_RATE = 1e-4


def main():
    train_dataset = datasets.ImageFolder(DATA_DIR / "train", transform=build_train_transform())
    val_dataset = datasets.ImageFolder(DATA_DIR / "val", transform=build_eval_transform())

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = mobilenet_v2(weights=MobileNet_V2_Weights.DEFAULT)
    model.classifier[1] = nn.Linear(model.classifier[1].in_features, len(train_dataset.classes))
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE)

    for epoch in range(NUM_EPOCHS):
        model.train()
        for images, labels in train_loader:
            images = images.to(device)
            labels = labels.to(device)
            optimizer.zero_grad()
            loss = criterion(model(images), labels)
            loss.backward()
            optimizer.step()

        model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images = images.to(device)
                labels = labels.to(device)
                predictions = model(images).argmax(dim=1)
                correct += (predictions == labels).sum().item()
                total += labels.size(0)

        accuracy = correct / total if total else 0
        print(f"epoch={epoch + 1} val_accuracy={accuracy:.4f}")

    torch.save(
        {"model_state_dict": model.state_dict(), "classes": train_dataset.classes},
        "mobilenet_v2_finetuned.pt",
    )


if __name__ == "__main__":
    main()
