import { Button } from "../components/ui/button";

export default function Home() {
  return (
    <>
      <div class="absolute top-0 -z-10 h-full w-full bg-white">
        <div class="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
        <section class="py-16">
          <div class="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
            <div class="lg:py-14 lg:px-20 p-10 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-between flex-col">
              <div class="block text-center mb-5 lg:text-left lg:mb-0">
                <h2 class="font-manrope text-lg lg:text-4xl md:text-2xl  text-white font-semibold mb-5 lg:mb-2">
                  The Ultimate Interview Practice Platform
                </h2>
                <p class="text-lg text-indigo-100">
                  Your ultimate platform to master interview skills and unlock
                  success—start practicing today to elevate your career to new
                  heights
                </p>
              </div>
              <div className="mt-4">
                <a
                  href="/dashboard"
                  class="flex items-center gap-4 bg-white rounded-full shadow-sm text-lg text-indigo-600 font-semibold py-4 px-8 transition-all duration-500"
                >
                  Get Started
                  <svg
                    width="19"
                    height="14"
                    viewBox="0 0 19 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.75 7L16.4167 7M11.8333 12.5L16.6852 7.64818C16.9907 7.34263 17.1435 7.18985 17.1435 7C17.1435 6.81015 16.9907 6.65737 16.6852 6.35182L11.8333 1.5"
                      stroke="#4F46E5"
                      stroke-width="2.4"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
