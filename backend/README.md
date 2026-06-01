# AI Object Recognition Alarm App Backend

This is the FastAPI backend for an Android AI alarm app. It receives images, runs PyTorch object recognition, and returns whether the alarm unlock condition succeeded.

## Features

- General object recognition with ResNet18 or MobileNetV2
- Custom object registration with multiple images
- Custom object matching with cosine similarity
- FastAPI Swagger UI for browser testing

## Folder Structure

```text
backend/
  main.py
  model_loader.py
  preprocessing.py
  general_classifier.py
  custom_similarity.py
  storage.py
  schemas.py
  constants.py
  requirements.txt
  registered_objects/
  embeddings/
  README.md
```

## Setup on Windows

Step 1: Open terminal in this folder:

```text
backend/
```

Step 2: Create a virtual environment:

```bash
python -m venv venv
```

Step 3: Activate the virtual environment:

```bash
venv\Scripts\activate
```

Step 4: Install packages:

```bash
pip install -r requirements.txt
```

Step 5: Run the backend server:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

Step 6: Open Swagger UI:

```text
http://127.0.0.1:8000/docs
```

## Setup on macOS or Linux

Step 1: Open terminal in this folder:

```text
backend/
```

Step 2: Create a virtual environment:

```bash
python -m venv venv
```

Step 3: Activate the virtual environment:

```bash
source venv/bin/activate
```

Step 4: Install packages:

```bash
pip install -r requirements.txt
```

Step 5: Run the backend server:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### GET /

Returns basic API status.

### GET /health

Returns backend and model status.

### GET /objects/general

Returns the supported household object list.

### POST /predict/general

Form fields:

- `file`: uploaded image
- `target_object`: one household object name
- `model_name`: `resnet` or `mobilenet`

Example:

```bash
curl -X POST "http://127.0.0.1:8000/predict/general" -F "file=@test.jpg" -F "target_object=bottle" -F "model_name=resnet"
```

### POST /custom/register

Form fields:

- `object_id`: custom object name such as `my_bottle`
- `files`: at least 5 uploaded images

Example:

```bash
curl -X POST "http://127.0.0.1:8000/custom/register" -F "object_id=my_bottle" -F "files=@image1.jpg" -F "files=@image2.jpg" -F "files=@image3.jpg" -F "files=@image4.jpg" -F "files=@image5.jpg"
```

### POST /predict/custom

Form fields:

- `object_id`: registered custom object id
- `file`: uploaded image

Example:

```bash
curl -X POST "http://127.0.0.1:8000/predict/custom" -F "object_id=my_bottle" -F "file=@test.jpg"
```

### GET /objects/custom

Returns all registered custom objects.

## Notes

- Backend means the Python server that receives images and runs the AI model.
- API means the communication path between the mobile app and the backend server.
- Endpoint means one API address such as `/predict/general`.
- Virtual environment means an isolated Python environment for this project.
- The first run may take time because PyTorch downloads pretrained model weights.
- Do not upload `venv/`, `registered_objects/`, `embeddings/`, or large model files to GitHub unless you intentionally need them.
