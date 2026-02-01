import '../css/main.css';
import SecretButton from '../components/SecretButton';

export default function MyApp({ Component, pageProps }) {
    return (
        <>
            <Component {...pageProps} />
            <SecretButton />
        </>
    );
}
