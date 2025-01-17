import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Range } from 'react-range';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

let moodDescriptions = ["Very Unhappy", "Unhappy", "Neutral", "Happy", "Very Happy"];
moodDescriptions[-1] = "";

const Generator = () => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const navigateTo = useNavigate();

  const [maxBudget, setMaxBudget] = useState(100000);
  const [showMaxBudgetInput, setShowMaxBudgetInput] = useState(false);

  const [viewport, setViewport] = useState({
    center: [0, 0],
    zoom: 1,
  });
  const [showMapPopup, setShowMapPopup] = useState(false);
  
  const onSubmit = (data) => {
    navigateTo('/results', { state: { data } });
  };

  const moodValue = watch('moodSlider', -1);
  const budgetValues = watch('budgetSlider', [0, maxBudget]);

  const handleMaxBudgetChange = (e) => {
    const newMax = parseInt(e.target.value, 10) || 0;
    setMaxBudget(newMax);
    setValue('budgetSlider', [budgetValues[0], newMax]);
  };

  const handleMapClick = (event) => {
    const { lat, lng } = event.latlng;
    setValue('location', { latitude: lat, longitude: lng });
    setViewport({ ...viewport, center: [lat, lng], zoom: 10 });
    setShowMapPopup(false);
    console.log(lat, lng);
  };

  const openMapPopup = () => {
    setShowMapPopup(true);
  };

  const closeMapPopup = () => {
    setShowMapPopup(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">
      <div className="w-full max-w-2xl bg-gray-800 p-10 rounded-lg shadow-lg relative z-2 text-center mt-[7em] mb-20">
        <h1 className="text-4xl font-bold text-white mb-8">Plan Your Dream Vacation</h1>
        <p className="text-gray-300 mb-8">With AI, discover the perfect getaway based on your mood, budget, and starting location.</p>

        {showMapPopup && (
          <div className="absolute top-0 left-0 w-full h-full z-20 flex items-center justify-center bg-black bg-opacity-75">
            <div className="relative w-5/6 h-5/6 max-w-4xl max-h-4xl bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <MapContainer
                center={viewport.center}
                zoom={viewport.zoom}
                className="w-full h-full"
                whenCreated={(map) => map.invalidateSize()}
                onClick={handleMapClick}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={viewport.center}>
                  <Popup>You are here</Popup>
                </Marker>
              </MapContainer>
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-200 focus:outline-none"
                onClick={closeMapPopup}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col">
            <label htmlFor="mood" className="text-sm font-medium text-gray-300 mb-2">Mood</label>
            <input
              type="text"
              id="mood"
              {...register('mood')}
              placeholder="How are you feeling today? (or use the slider below)"
              className="border border-gray-600 bg-gray-700 text-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              value={moodDescriptions[moodValue] && moodDescriptions[moodValue]}
            />
            <input
              type="range"
              id="moodSlider"
              min="0"
              max="4"
              step="1"
              defaultValue="-1"
              {...register('moodSlider')}
              onChange={(e) => setValue('mood', moodDescriptions[e.target.value])}
              className="w-full accent-indigo-600"
            />
            {errors.mood && <p className="text-red-500 text-sm mt-2">{errors.mood.message}</p>}
          </div>
          <div className="flex flex-col">
            <label htmlFor="budget" className="text-sm font-medium text-gray-300 mb-2">Budget (INR)</label>
            <input
              type="text"
              id="budget"
              {...register('budget')}
              placeholder="Estimated Travel Budget"
              className="border border-gray-600 bg-gray-700 text-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              value={`₹${budgetValues[0]} - ₹${budgetValues[1]}`}
              readOnly
            />
            <Range
              step={1000}
              min={0}
              max={maxBudget}
              values={budgetValues}
              onChange={(values) => setValue('budgetSlider', values)}
              renderTrack={({ props, children }) => (
                <div
                  {...props}
                  style={{
                    ...props.style,
                    height: '7px',
                    width: '100%',
                    backgroundColor: '#4a5568',
                    borderRadius: '3px',
                    margin: '0 10px',
                  }}
                >
                  {children}
                </div>
              )}
              renderThumb={({ props }) => (
                <div
                  {...props}
                  style={{
                    ...props.style,
                    height: '20px',
                    width: '20px',
                    backgroundColor: '#4f46e5',
                    borderRadius: '50%',
                    border: '2px solid #1a202c',
                  }}
                />
              )}
            />
            <button
              type="button"
              onClick={() => setShowMaxBudgetInput(!showMaxBudgetInput)}
              className="mt-4 text-indigo-400 underline"
            >
              Edit Max
            </button>
            {showMaxBudgetInput && (
              <div className="flex items-center mt-4">
                <label htmlFor="maxBudget" className="text-sm font-medium text-gray-300 mr-2">Max Budget:</label>
                <input
                  type="number"
                  id="maxBudget"
                  value={maxBudget}
                  onChange={handleMaxBudgetChange}
                  className="border border-gray-600 bg-gray-700 text-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
            {errors.budget && <p className="text-red-500 text-sm mt-2">{errors.budget.message}</p>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="loc" className="text-sm font-medium text-gray-300 mb-2">Starting Location</label>
            <div className="flex items-center mb-4">
              <input
                type="text"
                id="loc"
                {...register('loc', { required: 'Starting location is required' })}
                placeholder="Type in a place or select from map"
                className="border border-gray-600 bg-gray-700 text-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1"
              />
              <button
                type="button"
                onClick={openMapPopup}
                className="ml-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Show Map
              </button>
            </div>
            {errors.location && <p className="text-red-500 text-sm mt-2">{errors.location.message}</p>}
          </div>
          
          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            Generate Plan
          </button>
        </form>
      </div>
    </div>
  );
};

export default Generator;
