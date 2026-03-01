import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const AFFILIATE_STORAGE_KEY = 'roteiropen_affiliate';
const AFFILIATE_PARAM = 'ref';

export const useAffiliate = () => {
  const [searchParams] = useSearchParams();
  const [affiliateCode, setAffiliateCode] = useState<string | null>(() => {
    return localStorage.getItem(AFFILIATE_STORAGE_KEY);
  });

  useEffect(() => {
    const code = searchParams.get(AFFILIATE_PARAM);
    if (code) {
      localStorage.setItem(AFFILIATE_STORAGE_KEY, code);
      setAffiliateCode(code);
    }
  }, [searchParams]);

  return {
    affiliateCode,
  };
};
