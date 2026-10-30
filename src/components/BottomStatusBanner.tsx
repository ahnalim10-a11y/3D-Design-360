/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const BottomStatusBanner: React.FC<{ onOpenAndroidGuide: () => void }> = ({
  onOpenAndroidGuide,
}) => {
  return (
    <div className="w-full bg-[#0284C7] text-white py-1.5 px-3 text-[11px] font-medium border-t border-sky-600/60 shadow-inner select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sky-100">
          <span className="font-semibold text-white">সঠিক মাপ</span>
          <span className="opacity-50">|</span>
          <span className="font-semibold text-white">বাস্তবসম্মত ডিজাইন</span>
          <span className="opacity-50">|</span>
          <span className="font-semibold text-white">আধুনিক প্রযুক্তি</span>
          <span className="opacity-50">|</span>
          <span className="hidden md:inline font-semibold text-white">আপনার বাড়ি, আপনার পরিকল্পনা</span>
        </div>

        <button
          onClick={onOpenAndroidGuide}
          className="flex items-center gap-1.5 bg-white text-[#0284C7] px-2.5 py-0.5 rounded-full font-bold hover:bg-sky-50 shadow-sm transition cursor-pointer"
        >
          <span>3D DESIGN 360°</span>
          <span className="text-[10px] text-sky-800">Android App (APK) — প্রস্তুত</span>
        </button>
      </div>
    </div>
  );
};
