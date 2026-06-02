import { API_BASE_URL } from "../constants/config";

function makeUrl(path) {
  return `${API_BASE_URL}${path}`;
}

function createImagePart(uri, name = "photo.jpg") {
  return {
    uri,
    name,
    type: "image/jpeg"
  };
}

async function parseResponse(response) {
  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    const detail = data?.detail || "Server returned an error.";
    throw new Error(detail);
  }

  return data;
}

function explainNetworkError(error) {
  if (String(error.message).includes("Network request failed")) {
    throw new Error("Backend connection failed. Check API_BASE_URL or make sure FastAPI is running.");
  }
  throw error;
}

export async function checkHealth() {
  try {
    const response = await fetch(makeUrl("/health"));
    return await parseResponse(response);
  } catch (error) {
    explainNetworkError(error);
  }
}

export async function getGeneralObjects() {
  try {
    const response = await fetch(makeUrl("/objects/general"));
    return await parseResponse(response);
  } catch (error) {
    explainNetworkError(error);
  }
}

export async function predictGeneral(imageUri, targetObject, modelName) {
  const formData = new FormData();
  formData.append("file", createImagePart(imageUri, "general-photo.jpg"));
  formData.append("target_object", targetObject);
  formData.append("model_name", modelName);

  try {
    const response = await fetch(makeUrl("/predict/general"), {
      method: "POST",
      body: formData
    });
    return await parseResponse(response);
  } catch (error) {
    explainNetworkError(error);
  }
}

export async function registerCustomObject(objectId, imageUris) {
  const formData = new FormData();
  formData.append("object_id", objectId);
  imageUris.forEach((uri, index) => {
    formData.append("files", createImagePart(uri, `custom-${index + 1}.jpg`));
  });

  try {
    const response = await fetch(makeUrl("/custom/register"), {
      method: "POST",
      body: formData
    });
    return await parseResponse(response);
  } catch (error) {
    explainNetworkError(error);
  }
}

export async function predictCustom(objectId, imageUri) {
  const formData = new FormData();
  formData.append("object_id", objectId);
  formData.append("file", createImagePart(imageUri, "custom-check.jpg"));

  try {
    const response = await fetch(makeUrl("/predict/custom"), {
      method: "POST",
      body: formData
    });
    return await parseResponse(response);
  } catch (error) {
    explainNetworkError(error);
  }
}

export async function getCustomObjects() {
  try {
    const response = await fetch(makeUrl("/objects/custom"));
    return await parseResponse(response);
  } catch (error) {
    explainNetworkError(error);
  }
}

export async function deleteCustomObject(objectId) {
  try {
    const response = await fetch(makeUrl(`/custom/${encodeURIComponent(objectId)}`), {
      method: "DELETE"
    });
    return await parseResponse(response);
  } catch (error) {
    explainNetworkError(error);
  }
}
