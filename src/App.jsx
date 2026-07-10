import { useEffect, useState } from 'react';
import { searchKoreanDictionary } from './services/krdict';

const suggestiveEntries = [
    '안녕하세요',
    '감사합니다',
    '좋아요',
    '학교',
    '친구',
    '사랑',
];

function App() {
    const [query, setQuery] = useState('안녕하세요');
    const [activeQuery, setActiveQuery] = useState('안녕하세요');
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [speaking, setSpeaking] = useState(false);
    const [voices, setVoices] = useState([]);

    useEffect(() => {
        let ignore = false;
        console.log(`Searching for: ${activeQuery}`);
        async function loadResult() {
            setIsLoading(true);
            setStatusMessage('');
            try {
                const liveResult = await searchKoreanDictionary(activeQuery);
                if (!ignore) {
                    setResult(liveResult);
                    setStatusMessage(liveResult ? 'Live dictionary lookup succeeded.' : 'No dictionary result found for this term.');
                    console.log(`Lookup result for "${activeQuery}":`, liveResult);
                }
            } catch (error) {
                if (!ignore) {
                    setResult(null);
                    setStatusMessage('Live lookup unavailable. Please try again later.');
                    console.error(`Lookup failed for "${activeQuery}":`, error);
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                    console.log(`Finished lookup for "${activeQuery}"`);
                }
            }
        }

        loadResult();
        return () => {
            ignore = true;
            console.log(`Cancelled lookup for "${activeQuery}"`);
        };
    }, [activeQuery]);

    // Load available speech synthesis voices (client-side only)
    useEffect(() => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return undefined;
        const loadVoices = () => setVoices(window.speechSynthesis.getVoices() || []);
        loadVoices();
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
        return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    }, []);

    function speakKorean(text) {
        if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
        try {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.lang = 'ko-KR';
            console.log(voices);
            const koVoice = voices.find((v) => v.voiceURI && v.voiceURI == "Google 한국의");
            if (koVoice) u.voice = koVoice;
            u.onend = () => setSpeaking(false);
            u.onerror = () => setSpeaking(false);
            window.speechSynthesis.speak(u);
            setSpeaking(true);
        } catch (e) {
            // ignore
        }
    }

    function stopSpeech() {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        setSpeaking(false);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        setActiveQuery(query.trim());
    };

    return (
        <div className="app-shell">
            <header className="hero">
                <p className="eyebrow">Korean to English explorer</p>
                <h1>Learn the sound and meaning of Korean phrases.</h1>
                <p className="subtext">Search a phrase, see its romanization, and inspect which Korean pieces produce each sound.</p>

                <form className="search-bar" onSubmit={handleSubmit}>
                    <span className="search-icon" aria-hidden="true">
                        ⌕
                    </span>
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Try: 안녕하세요"
                        aria-label="Search Korean phrase"
                    />
                    <button type="submit">Search</button>
                </form>

                <div className="chip-row" aria-label="Suggested searches">
                    {suggestiveEntries.map((entry) => (
                        <button key={entry} type="button" className="chip" onClick={() => { setQuery(entry); setActiveQuery(entry); }}>
                            {entry}
                        </button>
                    ))}
                </div>
            </header>

            <main className="content">
                {isLoading ? (
                    <section className="result-card empty-state">
                        <h2>Searching the dictionary…</h2>
                        <p>Please wait while the live lookup runs.</p>
                    </section>
                ) : result ? (
                    <section className="result-card">
                        <div className="result-header">
                            <div>
                                <p className="eyeliner">Result</p>
                                <div className="title-row">
                                    <h2>{result.korean}</h2>
                                    <button
                                        type="button"
                                        className="speech-button"
                                        onClick={() => (speaking ? stopSpeech() : speakKorean(result.korean))}
                                        aria-pressed={speaking}
                                        aria-label={speaking ? 'Stop speech' : 'Speak Korean'}
                                        title={speaking ? 'Stop speech' : 'Speak Korean'}
                                    >
                                        {speaking ? '⏹' : '▶'}
                                    </button>
                                </div>
                                <div className="pill">{result.romanization || '—'}</div>
                                <p className="english-meaning">{result.english}</p>
                            </div>

                        </div>

                        {/* {statusMessage ? <p className="status-message">{statusMessage}</p> : null} */}

                        <div className="panel">
                            <h3>Meaning breakdown</h3>
                            <p className="bracket">
                                {result.meaningParts.map((part, index) => (
                                    <div key={part.char} className="bracket-piece">
                                        <span className="bracket-text">{part.char} = {part.meaning} </span> {index < result.meaningParts.length - 1 ? ' ' : ''}
                                    </div>
                                ))}
                            </p>
                        </div>

                        <div className="panel">
                            <h3>Sound breakdown</h3>
                            <div className="grid">
                                {result.breakdown.map((item) => (
                                    <div className="card">
                                        <div className="syllable">{item.syllable}</div>
                                        <div className="syllable-roman">{item.romanization}</div>
                                        <div className="parts">
                                            {item.parts.map((part, index) => (
                                                <span
                                                    key={`${item.syllable}-${index}`}
                                                    className={`part-chip ${part.changed ? 'changed' : ''}`}
                                                    title={part.changed ? `original: ${part.originalSound || '—'}` : ''}
                                                >
                                                    {part.char} → {part.sound}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </section>
                ) : (
                    <section className="result-card empty-state">
                        <h2>No match yet</h2>
                        <p>Try one of the example searches above or enter a phrase such as 안녕하세요.</p>
                    </section>
                )}
            </main>
        </div>
    );
}

export default App;
