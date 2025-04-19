// Housing Analysis Service - Calls the backend API for house image analysis

/**
 * Analyzes a house image using the backend API
 * @param {string} imageUrl - The URL of the image to analyze
 * @returns {Promise} - A promise that resolves to the analysis result
 */
export async function analyzeHouseImage(imageUrl) {
  try {
    console.log('Attempting to analyze image via backend:', imageUrl)

    // Since Firebase Storage has CORS restrictions, we'll pass the image URL directly to the backend
    // and let the Python backend fetch the image (which doesn't have browser CORS limitations)

    // Call the API with the image URL
    const apiUrl = 'http://localhost:5000/analyze-house-url'
    console.log(`Sending request to: ${apiUrl}`)

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Send the URL as JSON
      },
      body: JSON.stringify({ image_url: imageUrl }), // Send the URL in the body
    })

    if (!apiResponse.ok) {
      console.error(`API error status: ${apiResponse.status}`)
      // Try to get more details from the response body if possible
      let errorBody = 'No details available'
      try {
        errorBody = await apiResponse.text() // or .json() if the backend sends JSON errors
        console.error(`API error body: ${errorBody}`)
      } catch (e) {
        console.error('Could not read error response body:', e)
      }
      throw new Error(`API error: ${apiResponse.status} - ${errorBody}`)
    }

    return await apiResponse.json()
  } catch (error) {
    // Log the specific error caught
    console.error('Error in analyzeHouseImage function:', error)
    // Re-throw the error so the calling component can handle it
    throw error
  }
}

/**
 * Translates the housing condition class to a more user-friendly label in English
 * @param {string} classificationLabel - The class from the model ('baik', 'dhoif', or 'sederhana')
 * @returns {string} - A user-friendly label
 */
export function translateHousingClass(classificationLabel) {
  const translations = {
    baik: 'Good Condition',
    dhoif: 'Poor Condition',
    sederhana: 'Moderate Condition',
  }

  return translations[classificationLabel] || classificationLabel
}

/**
 * Returns an appropriate badge variant based on the housing condition class
 * @param {string} classificationLabel - The class from the model
 * @returns {string} - Badge variant ('success', 'warning', or 'destructive')
 */
export function getHousingClassVariant(classificationLabel) {
  const variants = {
    baik: 'success',
    dhoif: 'destructive',
    sederhana: 'warning',
  }

  return variants[classificationLabel] || 'secondary'
}
