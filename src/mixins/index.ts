import * as faceAPI from "face-api.js";

// eslint-disable-next-line no-unused-vars

const minConfidence = 0.5;

faceAPI.env.monkeyPatch({
  ImageData: ImageData,
  createCanvasElement: () => document.createElement("canvas"),
  createImageElement: () => document.createElement("img")
});

const stage = async () => {
  const folder = "/models";
  await faceAPI.nets.ssdMobilenetv1.load(folder);
  await faceAPI.nets.faceLandmark68Net.load(folder);
  await faceAPI.nets.ageGenderNet.load(folder);
  await faceAPI.nets.faceExpressionNet.load(folder);
};

stage();

function center(image: HTMLImageElement, canvas: HTMLCanvasElement) {
  const newImage = (image as unknown) as ImageBitmap;

  canvas.width = newImage.width;
  canvas.height = newImage.height;
}

/// detect all faces
async function faceDetect(image: HTMLImageElement, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  // ctx?.clearRect(0, 0, canvas.width, canvas.height);

  const faces = await faceAPI.detectAllFaces(
    (image as unknown) as faceAPI.TNetInput,
    new faceAPI.SsdMobilenetv1Options({ minConfidence })
  );

  center(image, canvas);

  ctx?.drawImage(image, 0, 0);
  faceAPI.draw.drawDetections(canvas, faces);
}

// detect age and gender
async function ageAndGenderDetect(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement
) {
  const ctx = canvas.getContext("2d");
  // ctx?.clearRect(0, 0, canvas.width, canvas.height);
  const ageAndGender = await faceAPI
    .detectAllFaces((image as unknown) as faceAPI.TNetInput)
    .withFaceLandmarks()
    .withAgeAndGender();

  faceAPI.draw.drawDetections(
    canvas,
    ageAndGender.map(res => res.detection)
  );

  center(image, canvas);

  ctx?.drawImage(image, 0, 0);
  ageAndGender.forEach(result => {
    const { age, gender, genderProbability } = result;
    new faceAPI.draw.DrawTextField(
      [
        `${faceAPI.utils.round(age, 0)} years`,
        `${gender} (${faceAPI.utils.round(genderProbability)})`
      ],
      result.detection.box.bottomLeft
    ).draw(canvas);
  });
}

// detect sentiment
async function sentimentDetect(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement
) {
  const ctx = canvas.getContext("2d");
  ctx?.clearRect(0, 0, canvas.width, canvas.height);
  const sentiment = await faceAPI
    .detectAllFaces((image as unknown) as faceAPI.TNetInput)
    .withFaceLandmarks()
    .withFaceExpressions();

  center(image, canvas);

  ctx?.drawImage(image, 0, 0);
  faceAPI.draw.drawDetections(
    canvas,
    sentiment.map(res => res.detection)
  );
  faceAPI.draw.drawFaceExpressions(canvas, sentiment);
}

export { faceDetect, ageAndGenderDetect, sentimentDetect };
