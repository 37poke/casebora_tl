import { Suspense } from "react";
import DashBoard from "./DashBoard";

const page = async () => {
 
  return (
    <Suspense>
      <DashBoard />
    </Suspense>
  
  )
};

export default page;
