export interface OtpProvider {
  sendOtp(phone: string, code: string): Promise<{
    success: boolean
    providerMessageId?: string
    error?: string
  }>
}

export class MockOtpProvider implements OtpProvider {
  async sendOtp(phone: string, code: string) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[MockOtpProvider] OTP for ${phone}: ${code}`)
    }
    return {
      success: true,
      providerMessageId: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    }
  }
}

let _provider: OtpProvider | null = null

export function getOtpProvider(): OtpProvider {
  if (_provider) return _provider

  const providerEnv = process.env.OTP_PROVIDER ?? "mock"

  switch (providerEnv) {
    case "mock":
      _provider = new MockOtpProvider()
      break
    // TODO: Add real SMS provider integration
    // case "sslwireless":
    // case "twilio":
    // case "vonage":
    default:
      _provider = new MockOtpProvider()
      break
  }

  return _provider
}

export function setOtpProvider(provider: OtpProvider) {
  _provider = provider
}
