from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
REGISTERED_OBJECTS_DIR = BASE_DIR / "registered_objects"
EMBEDDINGS_DIR = BASE_DIR / "embeddings"

GENERAL_CONFIDENCE_THRESHOLD = 0.40
CUSTOM_SIMILARITY_THRESHOLD = 0.88
CUSTOM_SECOND_BEST_MARGIN = 0.05
MIN_CUSTOM_IMAGES = 5
GENERAL_TOP_K = 10
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

# ImageNet pretrained classifiers often return labels that differ from the
# user-facing object names. Grouping related labels improves General Object
# Mode usability, but broad mappings can increase false positives.
OBJECT_TO_IMAGENET_LABELS = {
    "bottle": {
        "beer bottle",
        "bottle",
        "canteen",
        "hip flask",
        "jug",
        "milk can",
        "pill bottle",
        "pop bottle",
        "thermos",
        "vacuum flask",
        "water bottle",
        "water jug",
        "wine bottle",
    },
    "cup": {
        "chalice",
        "coffee mug",
        "cup",
        "drinking glass",
        "espresso cup",
        "goblet",
        "measuring cup",
        "mug",
        "tumbler",
        "wine glass",
    },
    "book": {
        "binder",
        "book",
        "book jacket",
        "comic book",
        "crossword puzzle",
        "envelope",
        "file",
        "jigsaw puzzle",
        "menu",
        "notebook",
        "packet",
        "paper towel",
        "ring binder",
    },
    "keyboard": {
        "computer keyboard",
        "keyboard",
        "keypad",
        "space bar",
        "typewriter keyboard",
    },
    "mouse": {
        "computer mouse",
        "joystick",
        "modem",
        "mouse",
        "mouse pad",
        "remote control",
        "switch",
    },
    "laptop": {
        "computer",
        "computer keyboard",
        "desktop computer",
        "laptop",
        "modem",
        "monitor",
        "mouse",
        "notebook",
        "notebook computer",
        "screen",
    },
    "toothbrush": {
        "hair spray",
        "lotion",
        "medicine chest",
        "soap dispenser",
        "toothbrush",
        "toothpaste",
    },
    "remote control": {
        "cassette player",
        "cellular telephone",
        "cordless telephone",
        "hand-held computer",
        "joystick",
        "mobile phone",
        "modem",
        "radio",
        "remote",
        "remote control",
        "switch",
    },
    "spoon": {"spoon"},
    "bowl": {"mixing bowl", "soup bowl"},
    "chair": {"folding chair", "rocking chair", "barber chair"},
    "clock": {"analog clock", "digital clock", "wall clock"},
}
