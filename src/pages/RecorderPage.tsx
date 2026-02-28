import { Navigate, useNavigate } from 'react-router-dom';
import { AudioRecorder } from '../features/recording';
import { useScriptContext } from '../shared/context/ScriptContext';
import { useUser } from '../shared';

export const RecorderPage = () => {
    const navigate = useNavigate();
    const { setCapturedAudio } = useScriptContext();
    const { freeScriptsRemaining, isPremium } = useUser();

    if (!isPremium && freeScriptsRemaining <= 0) {
        return <Navigate to="/paywall" replace />;
    }

    const handleAudioCaptured = (blob: Blob) => {
        setCapturedAudio(blob);
        navigate('/app/processando-audio');
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 'calc(100vh - 120px)',
            width: '100%',
            marginTop: '-40px'
        }}>
            <AudioRecorder onAudioCaptured={handleAudioCaptured} />
        </div>
    );
};
