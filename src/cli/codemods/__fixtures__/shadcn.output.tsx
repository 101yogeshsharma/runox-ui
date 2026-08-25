import React from "react";
import { Button, Card } from "@runox/ui";

export function Example() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Title</Card.Title>
      </Card.Header>
      <Card.Body>
        <Button variant="outline" size="custom">
          Click
        </Button>
      </Card.Body>
    </Card>
  );
}
