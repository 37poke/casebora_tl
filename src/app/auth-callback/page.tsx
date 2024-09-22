"use client"

import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { getAuthStatus } from "./action"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"


const Page = () => {
    const [configId, setConfigId] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        //获取id
        const configurationId = localStorage.getItem("configurationId")
        console.log(configurationId)
        
        if (configurationId) setConfigId(configurationId)
    },[])

    const { data } = useQuery ({
        queryKey: ["auth-callback"],
        queryFn: async () => await getAuthStatus(),
        retry: true,
        retryDelay: 500
    })
    console.log(configId);
    
    if (data?.success) {
        if (configId) {
            localStorage.removeItem("configurationId")
            router.push(`/configure/preview?id=${configId}`)
        } else {
            router.push('/')
        }
    }

    return (
        <div className="w-full mt-25 flex justify-center">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-500"/>
                <h3 className="font-semibold text-xl">Logging you in ...</h3>
                <p>You will be redirect automatically.</p>
            </div>
        </div>
    )

}
export default Page