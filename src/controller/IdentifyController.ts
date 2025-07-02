import { Request, Response } from 'express';
import { Contact } from '../models/Contact';
import { Op, Sequelize } from 'sequelize';

export const identifyContact = async (req: Request, res: Response): Promise<void> => {
  const { email, phoneNumber } = req.body;

  if (!email || !phoneNumber) {
    res.status(400).json({ error: 'email or phoneNumber is required' });
    return;
  }
  let transaction;
  try {
    transaction = await Contact.sequelize!.transaction();

    const existingContacts = await Contact.findAll({
      where: {
        [Op.or]: [
          email ? { email } : undefined,
          phoneNumber ? { phoneNumber } : undefined,
        ].filter(Boolean) as any[],
      },
      order: [['createdAt', 'ASC']],
      transaction,
    });
  
    if (existingContacts.length === 0) {
      const newContact = await Contact.create({
        email,
        phoneNumber,
        linkPrecedence: 'primary',
      }, { transaction });
  
      await transaction.commit();
      res.status(200).json({
        contact: {
          primaryContactId: newContact.id,
          emails: [newContact.email].filter(Boolean),
          phoneNumbers: [newContact.phoneNumber].filter(Boolean),
          secondaryContactIds: [],
        },
      });
  
      return;
    }
  
    const emailExists = existingContacts.some(e => email && e.email && e.email === email);
    const phoneExists = existingContacts.some(e => phoneNumber && e.phoneNumber && e.phoneNumber === phoneNumber);
  
    const primaryContacts = existingContacts.filter(e => e.linkPrecedence === 'primary' );
  
    const primary = await updatePrimaryPrecedence(transaction, primaryContacts);
  
    if((email && !emailExists) || (phoneNumber && !phoneExists)) {
      // add
      const newSecondary = await Contact.create({
        email,
        phoneNumber,
        linkPrecedence: 'secondary',
        linkedId: primary.id,
      }, { transaction });
    }
    // if(phoneNumber && !phoneExists) {
    //   const newSecondary = await Contact.create({
    //     email,
    //     phoneNumber,
    //     linkPrecedence: 'secondary',
    //     linkedId: primary.id,
    //   }, { transaction });
    // }
  
    // const primaryContact = existingContacts.find(c => c.linkPrecedence === 'primary') || existingContacts[0];
  
    const allRelatedContacts = await Contact.findAll({
      where: {
        [Op.or]: [
          { id: primary.id },
          { linkedId: primary.id },
          { id: { [Op.in]: existingContacts.map(c => c.id) } },
          { linkedId: { [Op.in]: existingContacts.map(c => c.id) } },
        ],
      },
      transaction,
    });
  
    const uniqueEmails = new Set<string>();
    const uniquePhones = new Set<string>();
    const secondaryIds: number[] = [];

    primary.email ?? uniqueEmails.add(primary.email)
    primary.email ?? uniquePhones.add(primary.phoneNumber)
  
    allRelatedContacts.forEach(contact => {
      if (contact.email) uniqueEmails.add(contact.email);
      if (contact.phoneNumber) uniquePhones.add(contact.phoneNumber);
      if (contact.id !== primary.id) secondaryIds.push(contact.id);
    });
  
    // Step 5: If current input is new (not in existing), create secondary
    // const alreadyExists = allRelatedContacts.some(
    //   c => c.email === email && c.phoneNumber === phoneNumber
    // );
  
    // if (!alreadyExists) {
    //   const newSecondary = await Contact.create({
    //     email,
    //     phoneNumber,
    //     linkPrecedence: 'secondary',
    //     linkedId: primaryContact.id,
    //   }, { transaction });
    //   secondaryIds.push(newSecondary.id);
    //   if (email) uniqueEmails.add(email);
    //   if (phoneNumber) uniquePhones.add(phoneNumber);
    // }
  
    await transaction.commit();
    res.status(200).json({
      contact: {
        primaryContactId: primary.id,
        emails: Array.from(uniqueEmails),
        phoneNumbers: Array.from(uniquePhones),
        secondaryContactIds: secondaryIds,
      },
    });
    return;
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ error: 'Internal server error' });
  }
};


// ...existing code...

/**
 * Updates the linkPrecedence of all but the oldest primary contact to 'secondary'.
 * @param transaction Sequelize transaction object
 * @param primaryContacts Array of primary Contact instances
 */
async function updatePrimaryPrecedence(
  transaction: any,
  primaryContacts: Contact[]
): Promise<Contact> {
  if (primaryContacts.length <= 1) return primaryContacts[0];

  // Find the oldest primary contact
  const oldest = primaryContacts.reduce((prev, curr) =>
    prev.createdAt < curr.createdAt ? prev : curr
  );

  // Update all other primary contacts to secondary and set their linkedId to the oldest's id
  const updates = primaryContacts
    .filter(c => c.id !== oldest.id)
    .map(c =>
      c.update(
        { linkPrecedence: 'secondary', linkedId: oldest.id },
        { transaction }
      )
    );

  await Promise.all(updates);

  return oldest
}

// ...existing code...