export const EmptyStateIllustration = () => (
  <div className="w-[148px] h-[140px] relative">
    <div className="w-[140px] h-[140px] rounded-full bg-gradient-to-br from-[#EFF0FF] to-[#DFE0F9] border-4 border-white shadow-lg relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="w-[98px] h-[97px] rounded-lg bg-gradient-to-br from-[#B5C0FF] to-[#5464DA] relative">
            <div className="absolute top-5 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-[43px] h-[17px] bg-gradient-to-r from-[#B1BDFF] to-[#7288FE] rounded-full"></div>
              <div className="w-[25px] h-[17px] bg-gradient-to-r from-[#B1BDFF] to-[#7288FE] rounded-full absolute top-0 left-2 rotate-90"></div>
            </div>
            <div className="absolute bottom-6 left-4 right-4">
              <div className="w-[62px] h-[14px] bg-white rounded mb-3"></div>
              <div className="flex items-center mb-2">
                <div className="w-1 h-1 bg-white rounded-full mr-1"></div>
                <div className="w-[47px] h-1 bg-white rounded"></div>
              </div>
              <div className="flex items-center">
                <div className="w-1 h-1 bg-white rounded-full mr-1"></div>
                <div className="w-[32px] h-1 bg-white rounded"></div>
              </div>
            </div>
          </div>
          <div className="absolute -top-5 -right-5 w-[34px] h-[34px] bg-[#0AA4E7] rounded-full border-3 border-white flex items-center justify-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 3V11M3 7H11"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
);
