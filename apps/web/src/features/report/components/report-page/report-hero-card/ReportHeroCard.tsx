import {
  ReportCardTextureImage,
  ReportGlowBottomImage,
  ReportGlowTopImage,
} from '@/shared/assets/images/report-card';

import './reportHeroCard.css';

/** 리포트 생성 중 상태를 보여주는 카드 조립 애니메이션입니다. */
export default function ReportHeroCard() {
  return (
    <div aria-hidden className="report-hero-card">
      <div className="report-card-layer report-card-layer--back">
        <div className="report-card-face report-card-face--back">
          <img alt="" className="report-card-texture" src={ReportCardTextureImage} />
        </div>
      </div>

      <div className="report-card-anchor report-card-anchor--front">
        <div className="report-card-glow report-card-glow--bottom">
          <img alt="" className="report-card-glow-image" src={ReportGlowBottomImage} />
        </div>

        <div className="report-card-layer report-card-layer--middle">
          <div className="report-card-face report-card-face--middle">
            <img alt="" className="report-card-texture" src={ReportCardTextureImage} />
          </div>
        </div>

        <div className="report-card-glow report-card-glow--top">
          <img alt="" className="report-card-glow-image" src={ReportGlowTopImage} />
        </div>

        <div className="report-card-layer report-card-layer--front">
          <div className="report-card-face report-card-face--front">
            <span className="report-card-question-panel" />
            <img alt="" className="report-card-texture" src={ReportCardTextureImage} />
            <span className="report-card-question">?</span>
          </div>
        </div>
      </div>

      <span className="report-card-sparkle report-card-sparkle--large" />
      <span className="report-card-sparkle report-card-sparkle--medium" />
      <span className="report-card-sparkle report-card-sparkle--small" />
    </div>
  );
}
