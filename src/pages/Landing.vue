<template>
    <div class="font-roboto text-white min-w-screen min-h-screen bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800">
        <div class="flex flex-col gap-12 font-black absolute top-1/2 -translate-y-1/2 left-2">
            <div>
                <div class="italic text-[104px] leading-[0.8]">
                    INTRVL
                </div>
                <div class="text-[17px]">
                    Just a Simple, Customizable Interval Timer.
                </div>
            </div>
            <div class="text-[64px] leading-tight pt-4">
                No <div class="inline text-red-600">Ads</div>.<br />
                No <div class="inline text-red-600">Costs</div>.<br />
                No <div class="inline text-red-600">BS</div>.
            </div>
            <div class="text-[64px]">
                <RouterLink to="/home">
                    Start <div class="inline text-blue-600">Now</div>.
                </RouterLink>
            </div>
        </div>
        <div class="w-full text-center text-xl absolute bottom-2 left-1/2 -translate-x-1/2">
            <a href="https://jeffreyjin.com/">Jeffrey Jin</a> © {{ (new Date()).getFullYear() }}
        </div>
    </div>
</template>