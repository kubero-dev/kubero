module.exports = {
  importJWK: jest.fn().mockResolvedValue('mock-key'),
  exportJWK: jest.fn().mockImplementation((v) => v),
  SignJWT: jest.fn().mockImplementation((claims) => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setIssuer: jest.fn().mockReturnThis(),
    setSubject: jest.fn().mockReturnThis(),
    setAudience: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mock-jwt-token'),
  })),
  generateKeyPair: jest.fn().mockResolvedValue({ 
    privateKey: {"kty":"EC","x":"fake","y":"fake","crv":"P-256","d":"fake"},
    publicKey: {"kty":"EC","x":"fake","y":"fake","crv":"P-256"},
  })
};