import React, { useState } from 'react'
import { useNavigate,useLocation} from 'react-router-dom'

const VerifyOtp = () => {
    const navigate=useNavigate()
    const location=useLocation()

    const {email}=location.state || {};
    const [otp, setOtp] = useState("")
    const handleSubmit=async (e)=>{
    e.preventDefault();
    let data={email:email,otp:otp}
      let r=await fetch("http://localhost:5000/api/auth/verify-otp",{method:"POST",headers:{"Content-Type":"application/json",},body:JSON.stringify(data)});
      let res=await r.json();
      console.log(data,res)

      if(res.status===200){

          navigate('/login')
      }
      else{
        console.log(res.message)
      }


  }
  return (
   <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-gray-900 to-amber-950 p-4">
      <form
        onSubmit={(e) => handleSubmit(e)}
        className="w-full max-w-md rounded-2xl bg-white p-8 sm:p-10 shadow-2xl"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-3xl">
            🔐
          </div>

          <h2 className="text-3xl font-bold text-gray-900">
            Verify Your OTP
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Enter the verification code sent to your
            email.
          </p>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <label
            htmlFor="otp"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            One-Time Password
          </label>

          <input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            maxLength={6}
            pattern="[0-9]{6}"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-gray-900 outline-none transition placeholder:text-base placeholder:font-normal placeholder:tracking-normal focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
            required
          />

          <p className="mt-2 text-xs text-gray-400">
            Enter the 6-digit verification code.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full rounded-xl bg-amber-500 py-3.5 font-semibold text-white shadow-lg shadow-amber-200 transition hover:bg-amber-600 active:scale-[0.98]"
        >
          Verify OTP →
        </button>

        {/* Resend */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={() => {
              // Add your resend OTP logic here
            }}
            className="font-semibold text-amber-600 hover:text-amber-800"
          >
            Resend OTP
          </button>
        </p>
      </form>
    </div>
  )
}

export default VerifyOtp
