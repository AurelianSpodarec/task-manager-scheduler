import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// React 19.2 + @testing-library/react auto-cleanup doesn't fire reliably
// when render is wrapped in async act(). Force explicit cleanup.
afterEach(cleanup)
