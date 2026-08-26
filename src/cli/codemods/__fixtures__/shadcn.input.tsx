import React from "react";
import {
  CardHeader,
  CardContent,
  CardTitle,
  Button,
} from "@/components/ui/button";

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="custom">
          Click
        </Button>
      </CardContent>
    </Card>
  );
}
