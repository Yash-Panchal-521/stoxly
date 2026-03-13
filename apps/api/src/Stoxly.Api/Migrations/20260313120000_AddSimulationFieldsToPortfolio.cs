using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stoxly.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSimulationFieldsToPortfolio : Migration
    {
        private const string PortfoliosTable = "portfolios";

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "portfolio_type",
                table: PortfoliosTable,
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "TRACKING");

            migrationBuilder.AddColumn<decimal>(
                name: "starting_cash",
                table: PortfoliosTable,
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "cash_balance",
                table: PortfoliosTable,
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "portfolio_type",
                table: PortfoliosTable);

            migrationBuilder.DropColumn(
                name: "starting_cash",
                table: PortfoliosTable);

            migrationBuilder.DropColumn(
                name: "cash_balance",
                table: PortfoliosTable);
        }
    }
}
