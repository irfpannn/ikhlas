// Housing Analysis Service - Calls the backend API for house image analysis

/**
 * Analyzes a house image using the backend API
 * @param {string} imageUrl - The URL of the image to analyze
 * @returns {Promise} - A promise that resolves to the analysis result
 */
export async function analyzeHouseImage(imageUrl) {
  try {
    // Convert image URL to file by fetching it
    const response = await fetch(imageUrl)
    const blob = await response.blob()

    // Create form data to send to API
    const formData = new FormData()
    formData.append('image', blob, 'house_image.jpg')

    // Call the API
    const apiResponse = await fetch('http://localhost:5000/analyze-house', {
      method: 'POST',
      body: formData,
    })

    if (!apiResponse.ok) {
      throw new Error(`API error: ${apiResponse.status}`)
    }

    return await apiResponse.json()
  } catch (error) {
    console.error('Error analyzing house image:', error)
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
