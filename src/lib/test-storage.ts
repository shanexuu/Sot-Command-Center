// Test function to check Supabase Storage configuration
import { createClientClient } from './supabase-client'

export async function testStorageConnection() {
  try {
    const supabase = createClientClient()

    console.log('Testing Supabase Storage connection...')

    // Check if we can list buckets
    const { data: buckets, error: bucketError } =
      await supabase.storage.listBuckets()

    if (bucketError) {
      console.error('Error listing buckets:', bucketError)
      return { success: false, error: bucketError.message }
    }

    console.log(
      'Available buckets:',
      buckets?.map((b) => ({ name: b.name, public: b.public }))
    )

    // Check if documents bucket exists
    const documentsBucket = buckets?.find((b) => b.name === 'documents')

    if (!documentsBucket) {
      console.error('Documents bucket not found!')
      return {
        success: false,
        error:
          'Documents bucket not found. Please create it in Supabase Dashboard.',
      }
    }

    console.log('Documents bucket found:', documentsBucket)

    // Try to list files in documents bucket
    const { data: files, error: listError } = await supabase.storage
      .from('documents')
      .list('', { limit: 10 })

    if (listError) {
      console.error('Error listing files:', listError)
      return { success: false, error: listError.message }
    }

    console.log('Files in documents bucket:', files)

    return { success: true, buckets, files }
  } catch (error) {
    console.error('Storage test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Test function to try uploading a simple file
export async function testFileUpload() {
  try {
    const supabase = createClientClient()

    // Create a simple test file
    const testContent = 'This is a test file for storage testing'
    const testFile = new File([testContent], 'test.txt', { type: 'text/plain' })

    console.log('Testing file upload...')

    const { data, error } = await supabase.storage
      .from('documents')
      .upload('test/test-file.txt', testFile)

    if (error) {
      console.error('Upload test failed:', error)
      return { success: false, error: error.message }
    }

    console.log('Upload test successful:', data)

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl('test/test-file.txt')

    console.log('Public URL:', urlData.publicUrl)

    return { success: true, data, url: urlData.publicUrl }
  } catch (error) {
    console.error('File upload test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
