"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { ForgetSenseCardListResType } from "@/app/schemaValidations/ForgetSenseCard";
import { formatDateUTC } from "@/lib/extensions";
import { ForgetSenseCardApiRequest } from "@/app/apiRequest/ForgetSenseCard";
import ForgetSenseCardTable from './ForgetSenseCardTable';

export default function ForgetSenseCardPage() {
    const [ForgetSenseCard, setForgetSenseCard] = useState<ForgetSenseCardListResType | any>();
    const [dp, setDp] = useState<string>('');
    
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayFormatted = formatDateUTC(firstDay);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const lastDayFormatted = formatDateUTC(lastDay);

    const [startDate, setStartDate] = useState<string>(firstDayFormatted.substring(1));
    const [endDate, setEndDate] = useState<string>(lastDayFormatted.substring(1));
    const [department, setDepartment] = useState<string>('')

    const fetchData = async () => {

        try {
            const { payload } = await ForgetSenseCardApiRequest.getList({ department, startDate, endDate });
            setForgetSenseCard(payload);
        } catch (error) {
        }
      };
      useEffect(() => {
        fetchData();
      }, [endDate, startDate,department]);

    return (
        <div>
            <Tabs defaultValue="account" className="bg-gray-50">
                <TabsContent value="account" className="bg-gray-50">
                    <Card>
                        <CardHeader>
                            <CardTitle>{`ForgetSenseCard`}</CardTitle>
                            <CardDescription>
                                {`Make changes to your account here. Click save when you're done.`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="space-y-1">
                                <ForgetSenseCardTable ForgetSenseCard={ForgetSenseCard}
                                    onStartDate={setStartDate}
                                    onEndDate={setEndDate}
                                    onDepartment={setDepartment}
                                />
                            </div>
                        </CardContent>

                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}