import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BasicInfoStep    from '../components/creator/BasicInfoStep';
import RaceStep         from '../components/creator/RaceStep';
import ClassStep        from '../components/creator/ClassStep';
import AbilityScoresStep from '../components/creator/AbilityScoresStep';

const STEPS = ['Identity', 'Race', 'Class', 'Stats'];

export default function Creator() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  function next() {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else navigate('/sheet');
  }

  function back() {
    if (step > 0) setStep(s => s - 1);
    else navigate('/');
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 760 }}>

        {/* Step indicator */}
        <div className="step-indicator">
          {STEPS.map((name, i) => (
            <div
              key={i}
              className={`step-indicator-item${i < step ? ' done' : ''}${i === step ? ' active' : ''}`}
            >
              <div className="step-dot">{i < step ? '✓' : i + 1}</div>
              <div className="step-name">{name}</div>
            </div>
          ))}
        </div>

        {/* Step content */}
        {step === 0 && <BasicInfoStep />}
        {step === 1 && <RaceStep />}
        {step === 2 && <ClassStep />}
        {step === 3 && <AbilityScoresStep />}

        {/* Navigation */}
        <div className="step-nav">
          <button className="btn btn-ghost" onClick={back}>
            {step === 0 ? '← Cancel' : '← Back'}
          </button>
          <button className="btn btn-primary" onClick={next}>
            {step === STEPS.length - 1 ? 'Create Character →' : 'Next →'}
          </button>
        </div>

      </div>
    </div>
  );
}
