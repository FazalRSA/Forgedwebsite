import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface IndustryPartnersSectionProps {
  logos?: [string | null, string | null];
}

export const IndustryPartnersSection: React.FC<IndustryPartnersSectionProps> = ({
  logos = [null, null],
}) => {
  return (
    <section
      id="trusted-by-bmw"
      data-testid="industry-partners-section"
      className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12"
    >
      <div className="bg-[#121215] text-[#F5F5F7] rounded-3xl p-8 sm:p-12 border border-[#26262E]">
        <div className="flex flex-col items-center text-center space-y-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-[-0.02em] text-white">
            Our industry partners
          </h2>

          <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[0, 1].map((index) => {
              const logoSrc = logos[index];
              return (
                <div
                  key={index}
                  className="h-32 sm:h-40 rounded-2xl bg-[#18181D] border border-dashed border-[#2E2E38] hover:border-[#FF5500]/50 transition-colors flex items-center justify-center p-6"
                >
                  {logoSrc ? (
                    <img
                      src={logoSrc}
                      alt={`Industry Partner ${index + 1}`}
                      className="max-h-16 sm:max-h-20 max-w-[80%] object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-neutral-500">
                      <ImageIcon className="w-6 h-6 text-neutral-600" />
                      <span className="text-xs font-tech-mono uppercase tracking-[0.18em]">
                        Logo Placeholder 0{index + 1}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export const TrustedByBmwSection = IndustryPartnersSection;
