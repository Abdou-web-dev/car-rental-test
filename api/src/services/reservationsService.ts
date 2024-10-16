import { PrismaClient, Reservation } from "@prisma/client";
import CarsService from "./carsService";

const prisma = new PrismaClient();
const carsService = new CarsService();

export default class ReservationsService {
  // Helper function to calculate duration in days
  private calculateDuration(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationInMs = end.getTime() - start.getTime();
    return Math.ceil(durationInMs / (1000 * 60 * 60 * 24));
  }

  //create a new reservation
  async createReservation(userId: number, carId: number, startDate: Date, endDate: Date) {
    try {
      // Check if the end date is before the start date
      if (endDate <= startDate) {
        throw new Error("End date cannot be before start date.");
      }

      // Check if the car is available
      const isAvailable: boolean = await carsService.isCarAvailable(carId, startDate, endDate);

      // Context: This function "isCarAvailable" above is used to check if a car is available upon reservation creation based on the reservation records stored in the database.
      // Data Source: Prisma database.
      // Usage: Used in the createReservation function in reservationsService to ensure the car is available before creating a new reservation.

      // By ensuring that the reservation is only created when the car is available, this code helps prevent double bookings and maintain data integrity
      if (!isAvailable) {
        throw new Error("Car is already booked for the selected dates.");
      } else {
        // ensures that the reservation is only created if the car is available for the specified dates.
        const durationDays = this.calculateDuration(startDate, endDate);

        const newReservation = await prisma.reservation.create({
          data: {
            userId,
            carId,
            startDate,
            endDate,
            durationDays,
          },
        });
        return newReservation;
      }
    } catch (error) {
      console.error("Error creating reservation:", error);
      throw new Error("Failed to create reservation. Please try again later.");
    }
  }

  //Update details of an existing reservation.
  async updateReservation(reservationId: number, newData: Partial<Reservation>) {
    try {
      const { startDate, endDate } = newData;

      // Calculate durationDays if both startDate and endDate are provided
      let durationDays: number | undefined;
      if (startDate && endDate) {
        const startTime = new Date(startDate);
        const endTime = new Date(endDate);
        const timeDifference = endTime.getTime() - startTime.getTime();
        durationDays = Math.ceil(timeDifference / (1000 * 3600 * 24));
      }

      const updatedReservation = await prisma.reservation.update({
        where: { id: reservationId },
        data: {
          ...newData,
          durationDays, // Update durationDays if calculated
        },
      });
      return updatedReservation;
    } catch (error) {
      console.error("Error updating reservation:", error);
      throw new Error("Failed to update reservation. Please try again later.");
    }
  }

  //   Retrieve a list of reservations with the duration in days for each reservation.
  async getReservationsWithDuration() {
    const reservationsWithDuration = await prisma.reservation.findMany({
      select: {
        id: true,
        userId: true,
        startDate: true,
        endDate: true,
        durationDays: true,
      },
    });
    return reservationsWithDuration;
  }
}
