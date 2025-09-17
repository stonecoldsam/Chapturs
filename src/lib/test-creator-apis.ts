// Test script for the Creator Editor API endpoints
// This script tests the functionality of the works, sections, and glossary APIs

async function testCreatorEditorAPIs() {
  console.log('Testing Creator Editor API endpoints...')
  
  try {
    // Test 1: Create a new work
    console.log('\n1. Testing work creation...')
    const workData = {
      title: 'Test Novel',
      description: 'A test novel for the creator editor',
      formatType: 'novel',
      genres: ['fantasy', 'adventure'],
      tags: ['magic', 'hero'],
      maturityRating: 'PG',
      status: 'draft'
    }

    const workResponse = await fetch('/api/works', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workData)
    })

    const workResult = await workResponse.json()
    console.log('Work creation result:', workResult)

    if (workResult.success && workResult.work) {
      const workId = workResult.work.id
      console.log('✓ Work created successfully with ID:', workId)

      // Test 2: Create a section for this work
      console.log('\n2. Testing section creation...')
      const sectionData = {
        title: 'Chapter 1: The Beginning',
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'This is the beginning of our test story...'
                }
              ]
            }
          ]
        },
        wordCount: 50,
        status: 'draft'
      }

      const sectionResponse = await fetch(`/api/works/${workId}/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sectionData)
      })

      const sectionResult = await sectionResponse.json()
      console.log('Section creation result:', sectionResult)

      if (sectionResult.success) {
        console.log('✓ Section created successfully')
      } else {
        console.log('✗ Section creation failed:', sectionResult.error)
      }

      // Test 3: Create a glossary entry
      console.log('\n3. Testing glossary entry creation...')
      const glossaryData = {
        term: 'Mana',
        definition: 'Magical energy that flows through all living things',
        category: 'magic',
        aliases: ['magical energy', 'life force'],
        chapters: [1]
      }

      const glossaryResponse = await fetch(`/api/works/${workId}/glossary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(glossaryData)
      })

      const glossaryResult = await glossaryResponse.json()
      console.log('Glossary creation result:', glossaryResult)

      if (glossaryResult.success) {
        console.log('✓ Glossary entry created successfully')
      } else {
        console.log('✗ Glossary creation failed:', glossaryResult.error)
      }

    } else {
      console.log('✗ Work creation failed:', workResult.error)
    }

    // Test 4: Get user's works
    console.log('\n4. Testing works retrieval...')
    const worksResponse = await fetch('/api/works')
    const worksResult = await worksResponse.json()
    console.log('Works retrieval result:', worksResult)

    if (worksResult.success) {
      console.log('✓ Works retrieved successfully')
    } else {
      console.log('✗ Works retrieval failed:', worksResult.error)
    }

  } catch (error) {
    console.error('Test failed with error:', error)
  }
}

// Auto-run tests when page loads
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    console.log('Creator Editor API Test Suite')
    console.log('=============================')
    
    // Add a test button to the page for manual testing
    const testButton = document.createElement('button')
    testButton.textContent = 'Run API Tests'
    testButton.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      padding: 10px 20px;
      background: #007acc;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-family: monospace;
    `
    testButton.addEventListener('click', testCreatorEditorAPIs)
    document.body.appendChild(testButton)
  })
}

export { testCreatorEditorAPIs }
