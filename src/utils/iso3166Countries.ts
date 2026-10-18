// ISO 3166-1 Country Codes
export interface ISO3166Country {
    Name: string;
    TwoLetterCode: string;
    ThreeLetterCode: string;
    NumericCode: string;
    PhonePrefix: string;
}

export const ISO3166Countries: ISO3166Country[] = [
    // { Name: "Afghanistan", TwoLetterCode: "AF", ThreeLetterCode: "AFG", NumericCode: "004" },
    { Name: "Nigeria", TwoLetterCode: "NG", ThreeLetterCode: "NGA", NumericCode: "566", PhonePrefix: "234" },

];

// Helper function to find country by numeric code
export const findCountryByNumericCode = (numericCode?: string | null): ISO3166Country | undefined => {
    if (!numericCode) return undefined;
    const normalized = numericCode.padStart(3, '0');
    return ISO3166Countries.find((c) => c.NumericCode.padStart(3, '0') === normalized);
};

// Helper function to find country by name
export const findCountryByName = (name: string): ISO3166Country | undefined =>
    ISO3166Countries.find((country) => country.Name === name);

// Helper function to find country by two-letter code
export const findCountryByTwoLetterCode = (code: string): ISO3166Country | undefined =>
    ISO3166Countries.find((country) => country.TwoLetterCode === code);


/**
 * Look up the E.164 phone prefix for a numeric ISO country code.
 * Returns "" when the country is unknown, so callers can fall back gracefully.
 */
export const getPhonePrefixByNumericCode = (numericCode?: string | number | null): string => {
    if (numericCode == null) return '';
    const country = findCountryByNumericCode(String(numericCode));
    return country?.PhonePrefix ?? '';
};

// Nigerian States
export interface NigerianState {
    name: string;
    code: string;
}

export const NigerianStates: NigerianState[] = [
    { name: "Abia", code: "Abia" },
    { name: "Adamawa", code: "Adamawa" },
    { name: "Akwa Ibom", code: "Akwa Ibom" },
    { name: "Anambra", code: "Anambra" },
    { name: "Bauchi", code: "Bauchi" },
    { name: "Bayelsa", code: "Bayelsa" },
    { name: "Benue", code: "Benue" },
    { name: "Borno", code: "Borno" },
    { name: "Cross River", code: "Cross River" },
    { name: "Delta", code: "Delta" },
    { name: "Ebonyi", code: "Ebonyi" },
    { name: "Edo", code: "Edo" },
    { name: "Ekiti", code: "Ekiti" },
    { name: "Enugu", code: "Enugu" },
    { name: "Federal Capital Territory", code: "Federal Capital Territory" },
    { name: "Gombe", code: "Gombe" },
    { name: "Imo", code: "Imo" },
    { name: "Jigawa", code: "Jigawa" },
    { name: "Kaduna", code: "Kaduna" },
    { name: "Kano", code: "Kano" },
    { name: "Katsina", code: "Katsina" },
    { name: "Kebbi", code: "Kebbi" },
    { name: "Kogi", code: "Kogi" },
    { name: "Kwara", code: "Kwara" },
    { name: "Lagos", code: "Lagos" },
    { name: "Nasarawa", code: "Nasarawa" },
    { name: "Niger", code: "Niger" },
    { name: "Ogun", code: "Ogun" },
    { name: "Ondo", code: "Ondo" },
    { name: "Osun", code: "Osun" },
    { name: "Oyo", code: "Oyo" },
    { name: "Plateau", code: "Plateau" },
    { name: "Rivers", code: "Rivers" },
    { name: "Sokoto", code: "Sokoto" },
    { name: "Taraba", code: "Taraba" },
    { name: "Yobe", code: "Yobe" },
    { name: "Zamfara", code: "Zamfara" },
];
