// userAsnafReportService.js
// Service for handling Asnaf report Firebase operations

import { db, storage, auth } from '@/firebase.config'
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

/**
 * Upload images to Firebase Storage
 * @param {Array} images - Array of image objects with file property
 * @returns {Promise<Array>} - Array of image download URLs
 */
export async function uploadReportImages(images) {
  const uploadedImageUrls = []

  if (images.length > 0) {
    for (const image of images) {
      if (image.file) {
        // Create a unique filename using timestamp
        const fileName = `asnaf_reports/${Date.now()}_${image.file.name}`
        const fileRef = storageRef(storage, fileName)

        // Upload the file
        await uploadBytes(fileRef, image.file)

        // Get the download URL
        const downloadURL = await getDownloadURL(fileRef)
        uploadedImageUrls.push(downloadURL)
      }
    }
  }

  return uploadedImageUrls
}

/**
 * Submit an asnaf report to Firestore
 * @param {Object} reportData - The report data to submit
 * @returns {Promise<Object>} - The document reference and status
 */
export async function submitAsnafReport(reportData) {
  try {
    // Upload images first if there are any
    const uploadedImageUrls = await uploadReportImages(reportData.images || [])

    // Prepare report data for Firestore
    const firestoreData = {
      name: reportData.name,
      address: reportData.address,
      phoneNumber: reportData.phoneNumber,
      description: reportData.description,
      location: reportData.location,
      imageUrls: uploadedImageUrls,
      status: 'pending', // Default status for new reports
      reportedAt: serverTimestamp(),
      reportedBy: auth.currentUser ? auth.currentUser.uid : null,
      rewardPoints: reportData.rewardPoints || 0,
    }

    // Save report to Firestore
    const reportsRef = collection(db, 'asnafReports')
    const docRef = await addDoc(reportsRef, firestoreData)
    console.log('Report submitted with ID:', docRef.id)

    // If user is logged in, update their reward points
    if (auth.currentUser) {
      await updateUserRewardPoints(reportData.rewardPoints || 0)
    }

    return {
      success: true,
      docRef,
      message: 'Report submitted successfully',
    }
  } catch (error) {
    console.error('Error submitting report:', error)
    return {
      success: false,
      error,
      message: 'Failed to submit report',
    }
  }
}

/**
 * Update user's reward points in Firestore
 * @param {number} points - Points to add to the user's total
 * @returns {Promise<Object>} - Status of the operation
 */
export async function updateUserRewardPoints(points) {
  try {
    if (!auth.currentUser) {
      return { success: false, message: 'User not authenticated' }
    }

    const userRef = doc(db, 'users', auth.currentUser.uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      // Update user's reward points
      await updateDoc(userRef, {
        rewardPoints: increment(points),
        totalReportsSubmitted: increment(1),
      })
      console.log('User reward points updated')
      return { success: true, message: 'Reward points updated' }
    } else {
      return { success: false, message: 'User document not found' }
    }
  } catch (error) {
    console.error('Error updating user reward points:', error)
    return {
      success: false,
      error,
      message: 'Failed to update reward points',
    }
  }
}

/**
 * Fetch all asnaf reports from Firestore
 * @returns {Promise<Array>} - Array of asnaf reports with their IDs
 */
export async function fetchAsnafReports() {
  try {
    const reportsRef = collection(db, 'asnafReports')
    const q = query(reportsRef, orderBy('reportedAt', 'desc'))
    const querySnapshot = await getDocs(q)

    const reports = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      // Convert Firestore timestamps to JavaScript Date objects
      const reportDate = data.reportedAt ? data.reportedAt.toDate() : new Date()
      const verifiedDate = data.verifiedAt ? data.verifiedAt.toDate() : null
      const rejectedDate = data.rejectedAt ? data.rejectedAt.toDate() : null

      reports.push({
        id: doc.id,
        ...data,
        reportDate,
        verifiedDate,
        rejectedDate,
        // Map Firestore data to match the component's expected format
        status: data.status?.charAt(0).toUpperCase() + data.status?.slice(1) || 'Pending',
        images: data.imageUrls ? data.imageUrls.map((url) => ({ url })) : [],
      })
    })

    return { success: true, reports }
  } catch (error) {
    console.error('Error fetching asnaf reports:', error)
    return { success: false, error, message: 'Failed to fetch asnaf reports' }
  }
}

/**
 * Verify an asnaf report
 * @param {string} reportId - The ID of the report to verify
 * @param {string} notes - Optional notes about the verification
 * @returns {Promise<Object>} - Status of the operation
 */
export async function verifyAsnafReport(reportId, notes = '') {
  try {
    const reportRef = doc(db, 'asnafReports', reportId)

    await updateDoc(reportRef, {
      status: 'verified',
      verifiedAt: serverTimestamp(),
      verifiedBy: auth.currentUser ? auth.currentUser.uid : 'admin',
      notes: notes || '',
    })

    return { success: true, message: 'Report verified successfully' }
  } catch (error) {
    console.error('Error verifying report:', error)
    return { success: false, error, message: 'Failed to verify report' }
  }
}

/**
 * Reject an asnaf report
 * @param {string} reportId - The ID of the report to reject
 * @param {string} notes - Optional notes about the rejection
 * @returns {Promise<Object>} - Status of the operation
 */
export async function rejectAsnafReport(reportId, notes = '') {
  try {
    const reportRef = doc(db, 'asnafReports', reportId)

    await updateDoc(reportRef, {
      status: 'rejected',
      rejectedAt: serverTimestamp(),
      rejectedBy: auth.currentUser ? auth.currentUser.uid : 'admin',
      notes: notes || '',
    })

    return { success: true, message: 'Report rejected successfully' }
  } catch (error) {
    console.error('Error rejecting report:', error)
    return { success: false, error, message: 'Failed to reject report' }
  }
}

/**
 * Convert an asnaf report to an asnaf recipient
 * @param {string} reportId - The ID of the report to convert
 * @param {Object} asnafData - Additional data about the asnaf
 * @returns {Promise<Object>} - Status of the operation
 */
export async function convertToAsnaf(reportId, asnafData) {
  try {
    // Get the report data first
    const reportRef = doc(db, 'asnafReports', reportId)
    const reportSnap = await getDoc(reportRef)

    if (!reportSnap.exists()) {
      return { success: false, message: 'Report not found' }
    }

    const reportData = reportSnap.data()

    // Create a new asnaf record in the asnafRecipients collection
    const asnafRef = collection(db, 'asnafRecipients')
    const newAsnafData = {
      name: reportData.name,
      address: reportData.address,
      phoneNumber: reportData.phoneNumber || '',
      location: reportData.location || null,
      category: asnafData.category,
      needs: asnafData.needs || reportData.description || '',
      status: 'active',
      images: reportData.imageUrls || [],
      createdAt: serverTimestamp(),
      createdFrom: reportId,
      createdBy: auth.currentUser ? auth.currentUser.uid : 'admin',
    }

    const docRef = await addDoc(asnafRef, newAsnafData)

    // Update the report status to indicate it's been converted
    await updateDoc(reportRef, {
      status: 'converted',
      convertedAt: serverTimestamp(),
      convertedBy: auth.currentUser ? auth.currentUser.uid : 'admin',
      convertedToAsnafId: docRef.id,
    })

    return {
      success: true,
      message: 'Report converted to asnaf successfully',
      asnafId: docRef.id,
    }
  } catch (error) {
    console.error('Error converting report to asnaf:', error)
    return { success: false, error, message: 'Failed to convert report to asnaf' }
  }
}
