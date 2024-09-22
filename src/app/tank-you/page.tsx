import { Suspense } from "react";
import ThankYou from "./TankYou";

export default function page () { 
    return (
        <Suspense>
            <ThankYou/>
        </Suspense>
    )
}