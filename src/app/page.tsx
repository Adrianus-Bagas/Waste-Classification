"use client";

import {useEffect, useRef, useState} from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";

const labels = ["Organic", "Recyclable"];

export default function WasteClassifier() {
  const videoRef = useRef(null);

  const [model, setModel] = useState<tf.GraphModel<string | tf.io.IOHandler>>();
  const [prediction, setPrediction] = useState("");

  const loadModel = async () => {
    await tf.setBackend("webgl");
    await tf.ready();

    const loadedModel = await tf.loadGraphModel("/model.json");

    console.log("Model loaded", loadedModel);
    setModel(loadedModel);
  };

  // 1. Load model
  useEffect(() => {
    if (model) return;
    loadModel();
  }, [model]);

  // 2. Start webcam
  useEffect(() => {
    async function setupCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      const video: any = videoRef.current;
      if (!video) return;

      video.srcObject = stream;

      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.play();
          resolve(0);
        };
      });
    }

    setupCamera();
  }, []);

  // 3. Prediction loop
  useEffect(() => {
    if (!model) return;

    const interval = setInterval(async () => {
      if (!videoRef.current) return;
      if (
        !videoRef.current ||
        (videoRef.current as any).videoWidth === 0 ||
        (videoRef.current as any).videoHeight === 0
      ) {
        return;
      }

      const video = videoRef.current;

      // Capture frame
      const tensor = tf.browser
        .fromPixels(video)
        .resizeNearestNeighbor([100, 100]) // adjust to your model input
        .toFloat()
        .div(255.0)
        .expandDims();

      // Predict
      const output: any = model.predict(tensor);
      const data = await output.data();

      console.log("data", data);

      const maxIndex = data.indexOf(Math.max(...data));
      setPrediction(labels[maxIndex]);

      tf.dispose(tensor);
      tf.dispose(output);
    }, 500); // every 0.5s

    return () => clearInterval(interval);
  }, [model]);

  return (
    <div>
      <h1>Waste Classifier</h1>
      <div className="flex items-center gap-5">
        <video ref={videoRef} width={300} height={300} autoPlay muted style={{borderRadius: 10}} />

        <h2>Prediction: {prediction}</h2>
      </div>
    </div>
  );
}
