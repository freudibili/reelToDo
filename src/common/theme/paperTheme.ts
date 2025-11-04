import { DefaultTheme } from 'react-native-paper';

const paperTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    accent: '#03dac4',
    background: '#ffffff',
    surface: '#ffffff',
    text: '#000000',
    disabled: '#f0f0f0',
    placeholder: '#a1a1a1',
    backdrop: '#000000',
    notification: '#f50057',
  },
};

export default paperTheme;