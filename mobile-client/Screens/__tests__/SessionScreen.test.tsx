import { Button, Text } from 'react-native';
import {beforeAll, describe, expect, jest, test} from '@jest/globals';
import { createMockUserBase, createUser } from '../../__mocks__/UserModel';
import {fireEvent, render, screen} from '@testing-library/react-native'
import { useDatabase, withObservables } from '@nozbe/watermelondb/react';

import SessionScreen from '../SessionScreen';
import { TestWrapper } from '../../__mocks__/TestWrapper';

jest.mock('../../contexts/ThemeProvider', () => {
    return {
        useTheme: () => ({ theme: 'dark' }),
    };
});

jest.mock('@nozbe/watermelondb/react', () => {
    return {
        withObservables: jest.fn((propsMapper) => (Component: any) => {
            return (props: any) => <Component {...props} {...propsMapper(props)} />;
        }),
        useDatabase: jest.fn(() => {
            return {
                get: jest.fn(),
                write: jest.fn(),
            };
        }),     

    };
})

jest.mock('../../components/DistanceProgressBar', () => {
    return {
        EnhancedDistanceProgressBar: jest.fn()
    };
});


describe('SessionScreen', () => {
    let testUser:any;
    beforeAll(async () => {
        const db = useDatabase()

        testUser = await createUser(db, createMockUserBase())
    })
   
    test('renders SessionScreen correctly', async () => {
 
        render(<TestWrapper testUser={testUser}>
            <SessionScreen />
        </TestWrapper>);
        expect(screen.getByText('Start Session')).toBeTruthy();
    })

});