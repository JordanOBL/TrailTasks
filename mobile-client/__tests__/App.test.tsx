import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { WrappedApp } from '../index';
import {testDb as watermelonDatabase} from '../watermelon/testDB';

describe('App', () => {

  test('loads initial bootsrap trails on first app load', async () => {
    const { getByTestId } = render(<WrappedApp />)
    // Wait up to 10 seconds for a condition
    await waitFor(
      async () => {
	const trails = await watermelonDatabase.get('trails').query().fetch();
	// Some assertion that ensures bootstrap is done
	expect(trails.length).toBe(96);
      },
      { timeout: 3000 } // 10 seconds
    );

  })


  });

