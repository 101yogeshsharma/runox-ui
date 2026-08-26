"use client";
import React from "react";
import { render } from "@testing-library/react";
import { Table } from "./Table";

describe("Table", () => {
  it("renders correctly", () => {
    const { getByText, getByRole } = render(
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Name</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Alice</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );

    expect(getByRole("table")).toBeInTheDocument();
    expect(getByText("Name")).toBeInTheDocument();
    expect(getByText("Alice")).toBeInTheDocument();
  });
});
