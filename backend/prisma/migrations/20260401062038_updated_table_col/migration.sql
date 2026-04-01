/*
  Warnings:

  - You are about to alter the column `bloodGroup` on the `patientrecord` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.
  - You are about to alter the column `status` on the `patientrecord` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(3))`.
  - The values [ADMIN] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `patientrecord` MODIFY `bloodGroup` ENUM('A_POSITIVE', 'A_NEGITIVE', 'B_POSITIVE', 'B_NEGITIVE', 'O_POSITIVE', 'O_NEGITIVE', 'AB_POSITIVE', 'AB_NEGITIVE', 'ABO_POSITIVE', 'ABO_NEGITIVE') NOT NULL,
    MODIFY `status` ENUM('Admitted', 'Discharged') NOT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('PATIENT', 'DOCTOR', 'SUPERADMIN') NOT NULL;
