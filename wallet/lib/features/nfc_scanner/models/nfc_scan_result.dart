// lib/features/nfc_scanner/models/nfc_scan_result.dart
import 'package:equatable/equatable.dart';

enum ScanType {
  nfcNdef, nfcIso7816, nfcMifare, nfcFelica,
  idCardOcr, qrCode, barcode, walletAddress,
}

class NfcRecord extends Equatable {
  final String typeNameFormat, type, payload;
  final String? id, decodedText;
  const NfcRecord({required this.typeNameFormat, required this.type, this.id, required this.payload, this.decodedText});
  Map<String, dynamic> toJson() => {'tnf': typeNameFormat, 'type': type, 'payload': payload, 'text': decodedText};
  @override List<Object?> get props => [type, payload];
}

class ThaiIdCardData extends Equatable {
  final String? citizenId, nameThEn, nameTh, dateOfBirth, dateOfIssue, dateOfExpiry, address, laser, rawMrz;
  const ThaiIdCardData({this.citizenId, this.nameThEn, this.nameTh, this.dateOfBirth, this.dateOfIssue, this.dateOfExpiry, this.address, this.laser, this.rawMrz});
  bool get isValid => citizenId != null && citizenId!.length == 13;
  bool get isExpired {
    if (dateOfExpiry == null) return false;
    try {
      final parts = dateOfExpiry!.split(' ');
      const months = {'JAN':1,'FEB':2,'MAR':3,'APR':4,'MAY':5,'JUN':6,'JUL':7,'AUG':8,'SEP':9,'OCT':10,'NOV':11,'DEC':12};
      final d = int.parse(parts[0]), m = months[parts[1].toUpperCase()] ?? 1, y = int.parse(parts[2]);
      return DateTime(y, m, d).isBefore(DateTime.now());
    } catch (_) { return false; }
  }
  Map<String, dynamic> toJson() => {'citizen_id': citizenId, 'name_en': nameThEn, 'name_th': nameTh, 'dob': dateOfBirth, 'expiry': dateOfExpiry, 'address': address, 'laser': laser};
  @override List<Object?> get props => [citizenId, laser];
}

class PassportData extends Equatable {
  final String? documentType, countryCode, surname, givenNames, documentNumber, nationality, dateOfBirth, sex, dateOfExpiry, personalNumber, rawMrz1, rawMrz2;
  const PassportData({this.documentType, this.countryCode, this.surname, this.givenNames, this.documentNumber, this.nationality, this.dateOfBirth, this.sex, this.dateOfExpiry, this.personalNumber, this.rawMrz1, this.rawMrz2});
  String get fullName => '${givenNames ?? ''} ${surname ?? ''}'.trim();
  @override List<Object?> get props => [documentNumber, dateOfBirth];
}

class NfcTagInfo extends Equatable {
  final String id, techType;
  final bool isNdef;
  final int? maxTransceive, capacity;
  const NfcTagInfo({required this.id, required this.techType, this.isNdef = false, this.maxTransceive, this.capacity});
  @override List<Object?> get props => [id, techType];
}

class WalletQrData extends Equatable {
  final String address, raw;
  final String? chain, token, memo;
  final double? amount;
  const WalletQrData({required this.address, this.chain, this.amount, this.token, this.memo, required this.raw});
  bool get isBsc => chain == 'BNB' || address.startsWith('0x');
  @override List<Object?> get props => [address, chain];
}

class NfcScanResult extends Equatable {
  final ScanType type;
  final DateTime timestamp;
  final String rawData;
  final NfcTagInfo? tagInfo;
  final List<NfcRecord>? ndefRecords;
  final ThaiIdCardData? thaiId;
  final PassportData? passport;
  final WalletQrData? walletQr;
  final String? qrText;
  final Map<String, dynamic>? chipData;
  final bool success;
  final String? errorMessage;

  const NfcScanResult({required this.type, required this.timestamp, required this.rawData, this.tagInfo, this.ndefRecords, this.thaiId, this.passport, this.walletQr, this.qrText, this.chipData, this.success = true, this.errorMessage});

  factory NfcScanResult.error(String msg) => NfcScanResult(type: ScanType.nfcNdef, timestamp: DateTime.now(), rawData: '', success: false, errorMessage: msg);

  Map<String, dynamic> toJson() => {'type': type.name, 'timestamp': timestamp.toIso8601String(), 'success': success, 'thai_id': thaiId?.toJson(), 'qr_text': qrText};
  @override List<Object?> get props => [type, timestamp, rawData];
}
