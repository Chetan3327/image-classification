import axios from "axios"
import { useState, DragEvent } from "react"

type Prediction = {
  class: string, 
  confidence: number
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
const App = () => {
  const [image, setImage] = useState<File | null>(null);
  const [dragging, setDragging] = useState<boolean>(false)
  const [selectedImage, setSelectedImage] = useState<string | null | undefined>(null)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>("")
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrediction(null)
    setImage(e.target.files[0])

    const file = e.target.files[0]
    if(file){
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    setPrediction(null)
    setImage(e.dataTransfer.files[0])

    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files[0]
    if(file){
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }

  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  const handleSubmit = async () => {
    if(!image){
      setErrorMessage("Please upload an image to predict.")
      return
    }

    const formData = new FormData()
    formData.append('file', image)

    try {
      const response = await axios.post(`${BACKEND_URL}/predict`, formData);

      if (response.status === 200) {
        const result = response.data;
        setPrediction(result);
        setErrorMessage('');
      } else {
        setErrorMessage('Error: Unable to make a prediction.');
        setPrediction(null);
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setErrorMessage('An error occurred while making the request.');
      setPrediction(null);
    }
  }

  return (
    <div className="flex min-h-screen justify-center items-center bg-[#f0f0f0]">
      <div className="bg-white rounded-xl shadow-lg p-5 text-center w-[90%] md:w-[400px]">
        <h1 className="text-2xl font-bold mb-5 text-[#ff6b6b]">CIFAR 10</h1>  

        <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`border-[2px] border-dashed cursor-pointer transition-colors duration-300 p-5 ${dragging && 'bg-[#f5f5f5]'}`}>
          <p>Drag and drop an image here</p>
          <label className="cursor-pointer text-[#007bff] underline" htmlFor="">
            <input onChange={handleImageUpload} className="hidden" accept="image/*" type="file" />
          </label>
        </div>

        {selectedImage && (<div className="flex flex-col items-center">
          <h3 className="mt-5 text-gray-500">Upladed Image</h3>
          <img className="w-[150px] h-auto" src={selectedImage} alt="selectedImage" />
          <button onClick={handleSubmit} className="px-4 p-2 bg-[#007bff] text-white border-none rounded-md cursor-pointer mt-4 transition-colors duration-300 hover:bg-[#0056b3]">Predict</button>
        </div>)}
        
        {prediction && (
          <>
            <p className="font-bold text-[#17a2b8] text-xl">{prediction.class}</p>
            <p className="text-xl text-[#ff5733]">{Math.round(prediction.confidence * 100) / 100}%</p>
          </>
        )}

        {errorMessage && (<div className="text-[#e74c3c] text-xs">{errorMessage}</div>)}
      </div>      
    </div>
  )
}

export default App
