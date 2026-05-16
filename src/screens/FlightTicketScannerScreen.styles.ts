import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#E0F2FE',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  buttonRow: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    gap: 16,
  },
  customButton: {
    backgroundColor: '#00223D',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    height: 54,
    maxWidth: 400,
    alignSelf: 'center',
  },
  customButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
  },
  image: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
    marginVertical: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  ocrContainer: {
    marginTop: 20,
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
  },
  ocrTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ocrText: {
    fontSize: 16,
    marginBottom: 2,
  },
});

export default styles;
