// __tests__/App.test.tsx
import React from 'react'
import renderer from 'react-test-renderer'
import App from '../App'
import { DatabaseProvider } from '@nozbe/watermelondb/react'
import { testDb } from '../watermelon/testDB'

// (Optional) Clean DB after each test
afterEach(async () => {
  await testDb.write(async () => {
    await testDb.unsafeResetDatabase()
  })
})

// A simple snapshot or integration test
it('renders correctly with real SQLite DB', async () => {
  // If the code inside <App /> calls WatermelonDB (including raw queries),
  // it will do so via the Node-based adapter now.
  const tree = renderer.create(
    <DatabaseProvider database={testDb}>
      <App />
    </DatabaseProvider>
  )

  // You might have an async operation that updates DB & re-renders,
  // so wrap in act if needed:
  // await renderer.act(async () => { ...some DB writes... })

  expect(tree.toJSON()).toMatchSnapshot()
})

