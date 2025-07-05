import { useContext } from 'react';
import TestContext from '../context/TestContext';

const useTest = () => useContext(TestContext);

export default useTest;
