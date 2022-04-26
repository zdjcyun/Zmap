/*
 * @Author: gisboss
 * @Date: 2021-04-07 23:11:51
 * @LastEditors: gisboss
 * @LastEditTime: 2021-04-07 23:16:27
 * @Description: file content
 */


// export default class AffineTransform {
//     constructor() {

//     }
//     /**
//      * Get generalized inverse use QR decomposition
//      * @param A arbitrary matrix
//      * @return matrix:PInvA of APInvAA=A | APInvA=I
//      */
//     static pInvQR(A: math.Matrix | math.MathArray): math.Matrix | math.MathArray {
//         // more reference:
//         // https://blog.csdn.net/xingozd/article/details/50417233
//         const QR = math.qr(A);
//         const Q = QR.Q;
//         const R = QR.R;
//         const RT = math.transpose(R);
//         const QT = math.transpose(Q);
//         const InvR = math.multiply(math.inv(math.multiply(RT, R)), RT);
//         const PInvA = math.multiply(InvR, QT);
//         return PInvA;
//     }

//     /**
//      * This function finds the affine transform between three points
//      * an affine transformation with a 3x3 affine transformation matrix:
//      * [M11 M12 M13]
//      * [M21 M22 M23]
//      * [M31 M32 M33]
//      * Since the third row is always [0 0 1] we can skip that.
//      * [x0 y0 1  0  0  0 ]     [M11]   [xp0]
//      * [0  0  0  x0 y0 1 ]     [M12]   [yp0]
//      * [x1 y1 1  0  0  0 ]     [M13]   [xp1]
//      * [0  0  0  x1 y1 1 ]  *  [M21] = [yp1]
//      * [x2 y2 1  0  0  0 ]     [M22]   [xp2]
//      * [0  0  0  x2 y2 1 ]     [M23]   [yp2]
//      *         A            *    X   =  BapplyMatrix3
//      * @param pointPairs [A B]
//      * @return matrix:x of Ax = B
//      */
//     static affineLeastSquare(pointPairs: [
//         [number, number],
//         [number, number]
//     ][]): math.Matrix {
//         // more reference:
//         // http://ros-developer.com/2017/12/26/finding-affine-transform-with-linear-least-squares/
//         // https://www.cnblogs.com/AndyJee/p/5053354.html

//         let A: number[][] = [];
//         let B: number[] = [];

//         pointPairs.forEach(pointPair => {
//             let p1 = pointPair[0];
//             let p2 = pointPair[1];
//             A.push([p1[0], p1[1], 1, 0, 0, 0]);
//             A.push([0, 0, 0, p1[0], p1[1], 1]);
//             B.push(p2[0]);
//             B.push(p2[1]);
//         });


//         // (A^TA)^(-1)
//         let AT = math.transpose(A);
//         let ATA = math.multiply(AT, A);

//         let ATAInv: math.Matrix | math.MathArray;
//         try {
//             ATAInv = math.inv(ATA) as math.MathArray
//         } catch (e) {
//             ATAInv = this.pInvQR(ATA) //这里应该使用正则项求解，要么直接在最开始就是用pinv求解
//         }

//         // X = (A^TA)^(-1)A^TB
//         let X = math.multiply(math.multiply(ATAInv, AT), B) as number[];

//         let x = math.matrix([
//             [X[0], X[1], X[2]],
//             [X[3], X[4], X[5]],
//             [0, 0, 1]
//         ]);
//         return x;
//     }

// }