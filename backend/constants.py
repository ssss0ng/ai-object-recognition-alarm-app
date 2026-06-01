from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
REGISTERED_OBJECTS_DIR = BASE_DIR / "registered_objects"
EMBEDDINGS_DIR = BASE_DIR / "embeddings"

GENERAL_CONFIDENCE_THRESHOLD = 0.55
CUSTOM_SIMILARITY_THRESHOLD = 0.68
MIN_CUSTOM_IMAGES = 5
GENERAL_TOP_K = 3
USE_CUSTOM_AUGMENTATION = True
USE_LOW_LIGHT_NORMALIZATION = True

SUPPORTED_MODEL_NAMES = {"resnet", "mobilenet"}
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}

HOUSEHOLD_OBJECTS = [
    "bottle",
    "cup",
    "book",
    "keyboard",
    "mouse",
    "laptop",
    "toothbrush",
    "remote control",
]

EXPERIMENTAL_HOUSEHOLD_OBJECTS = [
    "spoon",
    "bowl",
    "chair",
    "clock",
]

OBJECT_TO_IMAGENET_LABELS = {
    "bottle": {"water bottle", "pop bottle", "beer bottle", "wine bottle"},
    "cup": {"cup", "coffee mug", "mug"},
    "book": {"book", "comic book", "book jacket"},
    "keyboard": {"computer keyboard", "typewriter keyboard", "keyboard", "keypad"},
    "mouse": {"computer mouse", "mouse"},
    "laptop": {"laptop", "notebook", "notebook computer"},
    "toothbrush": {"toothbrush"},
    "remote control": {"remote control", "remote"},
    "spoon": {"spoon"},
    "bowl": {"mixing bowl", "soup bowl"},
    "chair": {"folding chair", "rocking chair", "barber chair"},
    "clock": {"analog clock", "digital clock", "wall clock"},
}
